import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SpoolmanClient } from "../client.js";
import { json, text } from "./util.js";

export function registerSystemTools(server: McpServer, client: SpoolmanClient): void {
  server.tool(
    "spoolman_get_info",
    "Get Spoolman instance info: version, whether an update is available, database type, backup settings and paths.",
    {},
    async () => json(await client.getInfo())
  );

  server.tool(
    "spoolman_health_check",
    "Check whether the Spoolman instance is healthy and reachable.",
    {},
    async () => json(await client.getHealth())
  );

  server.tool(
    "spoolman_trigger_backup",
    "Trigger a database backup on the Spoolman instance (SQLite only). Returns the backup file path.",
    {},
    async () => {
      const result = await client.triggerBackup();
      return text(
        result.created === false
          ? `No new backup needed (database unchanged since the last one). Latest backup: ${result.path}`
          : `Backup created: ${result.path}`
      );
    }
  );
}
