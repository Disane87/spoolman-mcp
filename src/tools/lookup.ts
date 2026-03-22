import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { SpoolmanClient } from "../client.js";

export function registerLookupTools(server: McpServer, client: SpoolmanClient): void {
  // ── GET /material ────────────────────────────
  server.tool(
    "spoolman_list_materials",
    "List all filament material types that exist in Spoolman (e.g. PLA, PETG, ABS).",
    {},
    async () => {
      const materials = await client.getMaterials();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(materials, null, 2),
          },
        ],
      };
    }
  );

  // ── GET /article-number ──────────────────────
  server.tool(
    "spoolman_list_article_numbers",
    "List all article numbers of filaments currently tracked in Spoolman.",
    {},
    async () => {
      const articleNumbers = await client.getArticleNumbers();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(articleNumbers, null, 2),
          },
        ],
      };
    }
  );

  // ── GET /lot-number ──────────────────────────
  server.tool(
    "spoolman_list_lot_numbers",
    "List all lot/batch numbers of spools currently tracked in Spoolman.",
    {},
    async () => {
      const lotNumbers = await client.getLotNumbers();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(lotNumbers, null, 2),
          },
        ],
      };
    }
  );

  // ── GET /location ────────────────────────────
  server.tool(
    "spoolman_list_locations",
    "List all spool storage locations defined in Spoolman.",
    {},
    async () => {
      const locations = await client.getLocations();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(locations, null, 2),
          },
        ],
      };
    }
  );

  // ── PATCH /location/{location} ───────────────
  server.tool(
    "spoolman_rename_location",
    "Rename an existing spool storage location. All spools at the old location will be updated to the new name.",
    {
      location: z.string().min(1).describe("The current location name"),
      new_name: z.string().min(1).describe("The new location name"),
    },
    async ({ location, new_name }) => {
      await client.renameLocation(location, new_name);
      return {
        content: [
          {
            type: "text",
            text: `Location '${location}' renamed to '${new_name}' successfully.`,
          },
        ],
      };
    }
  );
}
