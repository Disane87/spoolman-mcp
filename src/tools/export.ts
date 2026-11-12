import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { SpoolmanClient } from "../client.js";
import { text } from "./util.js";

const formatEnum = z.enum(["json", "csv"]).default("json").describe("Export format: 'json' (default) or 'csv'");

export function registerExportTools(server: McpServer, client: SpoolmanClient): void {
  server.tool(
    "spoolman_export_spools",
    "Export all spools (with filament and vendor data) as JSON or CSV. Can be large; prefer list/search tools for questions.",
    {
      format: formatEnum,
      allow_archived: z.boolean().optional().describe("Include archived spools (default false)"),
    },
    async ({ format, allow_archived }) => text(await client.exportSpools(format, allow_archived ?? false))
  );

  server.tool(
    "spoolman_export_filaments",
    "Export all filaments (with vendor data) as JSON or CSV.",
    { format: formatEnum },
    async ({ format }) => text(await client.exportFilaments(format))
  );

  server.tool(
    "spoolman_export_vendors",
    "Export all vendors as JSON or CSV.",
    { format: formatEnum },
    async ({ format }) => text(await client.exportVendors(format))
  );
}
