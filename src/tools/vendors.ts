import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { SpoolmanClient } from "../client.js";
import {
  defined,
  encodeExtra,
  extraFiltersSchema,
  extraValuesSchema,
  id,
  json,
  limitSchema,
  offsetSchema,
  page,
  prefixExtraFilters,
  sortSchema,
  text,
} from "./util.js";

export function registerVendorTools(server: McpServer, client: SpoolmanClient): void {
  server.tool(
    "spoolman_list_vendors",
    "List and search vendors (manufacturers) in Spoolman.",
    {
      name: z.string().optional().describe("Partial case-insensitive match on vendor name. Comma-separate for OR."),
      external_id: z.string().optional().describe("Match vendors imported from SpoolmanDB with this external ID"),
      extra_filters: extraFiltersSchema('"extra.<key>"'),
      sort: sortSchema("name:asc"),
      limit: limitSchema,
      offset: offsetSchema,
    },
    async (params) => {
      const { items, total } = await client.getVendors({
        ...params,
        extra_filters: prefixExtraFilters(params.extra_filters, ["extra."]),
      });
      return page(items, total, params.offset);
    }
  );

  server.tool("spoolman_get_vendor", "Get a single vendor by its ID.", { id: id("vendor") }, async ({ id }) =>
    json(await client.getVendor(id))
  );

  server.tool(
    "spoolman_create_vendor",
    "Create a new vendor in Spoolman.",
    {
      name: z.string().min(1).max(64).describe("Vendor name (required)"),
      comment: z.string().max(1024).optional().describe("Optional comment"),
      empty_spool_weight: z
        .number()
        .nonnegative()
        .optional()
        .describe("Weight of this vendor's empty spool in grams (used as default for new spools)"),
      external_id: z.string().max(256).optional().describe("ID in an external database such as SpoolmanDB"),
      extra: extraValuesSchema,
    },
    async ({ extra, ...rest }) => {
      const vendor = await client.createVendor({ ...rest, extra: encodeExtra(extra) });
      return json(vendor, "Vendor created:");
    }
  );

  server.tool(
    "spoolman_update_vendor",
    "Update an existing vendor by ID. Only provide the fields you want to change.",
    {
      id: id("vendor"),
      name: z.string().min(1).max(64).optional().describe("New name"),
      comment: z.string().max(1024).optional().describe("New comment"),
      empty_spool_weight: z.number().nonnegative().optional().describe("New empty spool weight in grams"),
      external_id: z.string().max(256).optional().describe("New external ID"),
      extra: extraValuesSchema,
    },
    async ({ id, extra, ...rest }) => {
      const vendor = await client.updateVendor(id, defined({ ...rest, extra: encodeExtra(extra) }));
      return json(vendor, "Vendor updated:");
    }
  );

  server.tool(
    "spoolman_delete_vendor",
    "Delete a vendor by ID. Filaments from this vendor are kept but lose their vendor reference.",
    { id: id("vendor") },
    async ({ id }) => {
      await client.deleteVendor(id);
      return text(`Vendor with ID ${id} deleted.`);
    }
  );
}
