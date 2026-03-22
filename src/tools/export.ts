import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { SpoolmanClient } from "../client.js";

const formatEnum = z.enum(["json", "csv"]).default("json");

export function registerExportTools(server: McpServer, client: SpoolmanClient): void {
  // ── GET /export/spools ───────────────────────
  server.tool(
    "spoolman_export_spools",
    "Export all spools from Spoolman as JSON or CSV.",
    {
      format: formatEnum.describe("Export format: 'json' (default) or 'csv'"),
    },
    async ({ format }) => {
      const data = await client.exportSpools(format);
      return {
        content: [
          {
            type: "text",
            text: data,
          },
        ],
      };
    }
  );

  // ── GET /export/filaments ────────────────────
  server.tool(
    "spoolman_export_filaments",
    "Export all filaments from Spoolman as JSON or CSV.",
    {
      format: formatEnum.describe("Export format: 'json' (default) or 'csv'"),
    },
    async ({ format }) => {
      const data = await client.exportFilaments(format);
      return {
        content: [
          {
            type: "text",
            text: data,
          },
        ],
      };
    }
  );

  // ── GET /export/vendors ──────────────────────
  server.tool(
    "spoolman_export_vendors",
    "Export all vendors from Spoolman as JSON or CSV.",
    {
      format: formatEnum.describe("Export format: 'json' (default) or 'csv'"),
    },
    async ({ format }) => {
      const data = await client.exportVendors(format);
      return {
        content: [
          {
            type: "text",
            text: data,
          },
        ],
      };
    }
  );
}
