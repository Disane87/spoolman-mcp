import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { SpoolmanClient } from "../client.js";
import { json, page, prefixExtraFilters, sortSchema } from "./util.js";
import { SPOOL_EXTRA_PREFIXES, spoolFilterSchema } from "./spools.js";

export function registerSearchTools(server: McpServer, client: SpoolmanClient): void {
  server.tool(
    "spoolman_search",
    "Free-text search across spools, filaments and vendors in one call. Every whitespace-separated term must " +
      "match some text field (e.g. 'bambu petg-cf'). A number also matches a spool ID. A hex code ('#ff0000') or " +
      "CSS color name ('red') also runs a color-similarity search over filaments. Best first tool for " +
      "'do I have any ...?' questions.",
    {
      q: z.string().min(1).describe("Search query"),
      limit: z.number().int().min(1).max(100).optional().describe("Max results per category (default 20)"),
      allow_archived: z.boolean().optional().describe("Include archived spools (default false)"),
      spools_per_filament: z
        .number()
        .int()
        .min(0)
        .max(10)
        .optional()
        .describe("Also return up to N spools for each matching filament (default 0)"),
      color_similarity_threshold: z
        .number()
        .min(0)
        .max(100)
        .optional()
        .describe("Color match tolerance for color queries (0 = exact, default 20)"),
    },
    async (params) => json(await client.search(params))
  );

  server.tool(
    "spoolman_group_spools",
    "Aggregate spools by filament, vendor, material, location or a custom spool field, returning per-group spool " +
      "count, in-use count, total remaining weight (g) and last use, plus grand totals. Accepts the same filters " +
      "as spoolman_list_spools. Ideal for inventory questions like 'how much PETG do I have?' or 'what's on shelf B?'.",
    {
      group_by: z
        .string()
        .min(1)
        .describe("'filament', 'vendor', 'material', 'location', or 'extra.<key>' (text/single-choice spool field)"),
      ...spoolFilterSchema,
      include_empty: z
        .boolean()
        .optional()
        .describe("With group_by filament/vendor: also list filaments/vendors that have no matching spools"),
      preview: z
        .boolean()
        .optional()
        .describe("Attach a few member spools (group_by=filament) or filaments (group_by=vendor) to each group"),
      sort: sortSchema("group.total_remaining:desc"),
      limit: z.number().int().positive().optional().describe("Maximum number of groups"),
      offset: z.number().int().min(0).optional().describe("Group pagination offset"),
    },
    async (params) => {
      const result = await client.getSpoolGroups({
        ...params,
        extra_filters: prefixExtraFilters(params.extra_filters, SPOOL_EXTRA_PREFIXES),
      });
      return json(
        result.groups,
        `Totals over all matching groups: ${result.total_groups ?? "?"} group(s), ${result.total_spools ?? "?"} ` +
          `spool(s), ${result.total_remaining_weight == null ? "?" : Math.round(result.total_remaining_weight)} g remaining.`
      );
    }
  );

  server.tool(
    "spoolman_search_external_filaments",
    "Search the external filament catalog (SpoolmanDB) by manufacturer, name and material, e.g. 'polymaker pla'. " +
      "Every word must match, and catalog names are usually color names rather than product lines, so search " +
      "'bambu lab pla black' rather than 'bambu pla basic'. " +
      "Returns accurate specs (density, diameter, weight, spool weight, temperatures, colors) and an id usable as " +
      "external_id when creating a filament.",
    {
      query: z.string().min(1).describe("Search terms, matched word-by-word"),
      limit: z.number().int().min(1).max(100).optional().describe("Max results (default 20)"),
      offset: z.number().int().min(0).optional().describe("Pagination offset"),
    },
    async ({ query, limit, offset }) => {
      const { items, total } = await client.searchExternalFilaments(query, limit, offset);
      return page(items, total, offset);
    }
  );

  server.tool(
    "spoolman_list_external_materials",
    "List material definitions from the external catalog (SpoolmanDB), with typical density and temperatures.",
    {},
    async () => json(await client.getExternalMaterials())
  );
}
