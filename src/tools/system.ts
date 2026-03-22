import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SpoolmanClient } from "../client.js";

export function registerSystemTools(server: McpServer, client: SpoolmanClient): void {
  // ── GET /info ────────────────────────────────
  server.tool(
    "spoolman_get_info",
    "Get general Spoolman API information (version, database type, debug mode, paths).",
    {},
    async () => {
      const info = await client.getInfo();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(info, null, 2),
          },
        ],
      };
    }
  );

  // ── GET /health ──────────────────────────────
  server.tool(
    "spoolman_health_check",
    "Check whether the Spoolman instance is healthy and reachable.",
    {},
    async () => {
      const health = await client.getHealth();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(health, null, 2),
          },
        ],
      };
    }
  );

  // ── POST /backup ─────────────────────────────
  server.tool(
    "spoolman_trigger_backup",
    "Trigger a database backup on the Spoolman instance (SQLite only). Returns the backup file path.",
    {},
    async () => {
      const result = await client.triggerBackup();
      return {
        content: [
          {
            type: "text",
            text: `Backup triggered successfully. Path: ${result.path}`,
          },
        ],
      };
    }
  );
}
