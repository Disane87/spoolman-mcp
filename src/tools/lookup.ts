import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { SpoolmanClient } from "../client.js";
import { json, text } from "./util.js";

export function registerLookupTools(server: McpServer, client: SpoolmanClient): void {
  server.tool(
    "spoolman_list_materials",
    "List all filament material types in use in Spoolman (e.g. PLA, PETG, ABS).",
    {},
    async () => json(await client.getMaterials())
  );

  server.tool(
    "spoolman_list_article_numbers",
    "List all article numbers of filaments tracked in Spoolman.",
    {},
    async () => json(await client.getArticleNumbers())
  );

  server.tool(
    "spoolman_list_lot_numbers",
    "List all lot/batch numbers of spools tracked in Spoolman.",
    {},
    async () => json(await client.getLotNumbers())
  );

  server.tool(
    "spoolman_list_locations",
    "List all spool storage locations in use in Spoolman.",
    {},
    async () => json(await client.getLocations())
  );

  server.tool(
    "spoolman_rename_location",
    "Rename a spool storage location. All spools at the old location are moved to the new name.",
    {
      location: z.string().min(1).describe("The current location name"),
      new_name: z.string().min(1).describe("The new location name"),
    },
    async ({ location, new_name }) => {
      await client.renameLocation(location, new_name);
      return text(`Location '${location}' renamed to '${new_name}'.`);
    }
  );
}
