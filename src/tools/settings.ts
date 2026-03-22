import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { SpoolmanClient } from "../client.js";

export function registerSettingsTools(server: McpServer, client: SpoolmanClient): void {
  // ── GET /setting/ ────────────────────────────
  server.tool(
    "spoolman_get_all_settings",
    "Retrieve all Spoolman configuration settings.",
    {},
    async () => {
      const settings = await client.getAllSettings();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(settings, null, 2),
          },
        ],
      };
    }
  );

  // ── GET /setting/{key} ───────────────────────
  server.tool(
    "spoolman_get_setting",
    "Retrieve a single Spoolman configuration setting by key.",
    {
      key: z.string().min(1).describe("The setting key"),
    },
    async ({ key }) => {
      const setting = await client.getSetting(key);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(setting, null, 2),
          },
        ],
      };
    }
  );

  // ── POST /setting/{key} ──────────────────────
  server.tool(
    "spoolman_set_setting",
    "Set a Spoolman configuration value by key.",
    {
      key: z.string().min(1).describe("The setting key"),
      value: z.unknown().describe("The new value to set"),
    },
    async ({ key, value }) => {
      const setting = await client.setSetting(key, value);
      return {
        content: [
          {
            type: "text",
            text: `Setting '${key}' updated:\n${JSON.stringify(setting, null, 2)}`,
          },
        ],
      };
    }
  );
}
