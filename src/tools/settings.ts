import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { Setting, SpoolmanClient } from "../client.js";
import { json } from "./util.js";

/** Settings values are JSON-encoded strings; decode them for readability. */
function decode(setting: Setting): Setting & { decoded_value?: unknown } {
  try {
    return { ...setting, decoded_value: JSON.parse(setting.value) };
  } catch {
    return setting;
  }
}

export function registerSettingsTools(server: McpServer, client: SpoolmanClient): void {
  server.tool(
    "spoolman_get_all_settings",
    "Retrieve all Spoolman settings (set or default). 'value' is JSON-encoded; 'decoded_value' is the parsed value.",
    {},
    async () => {
      const settings = await client.getAllSettings();
      return json(Object.fromEntries(Object.entries(settings).map(([k, v]) => [k, decode(v)])));
    }
  );

  server.tool(
    "spoolman_get_setting",
    "Retrieve a single Spoolman setting by key (e.g. 'currency').",
    { key: z.string().min(1).describe("The setting key") },
    async ({ key }) => json(decode(await client.getSetting(key)))
  );

  server.tool(
    "spoolman_set_setting",
    "Set a Spoolman setting. Pass the plain value matching the setting's type (string, number, boolean, " +
      "array or object), e.g. key 'currency', value 'EUR'. Pass null to reset to the default.",
    {
      key: z.string().min(1).describe("The setting key"),
      value: z.unknown().describe("The new value (plain, not JSON-encoded), or null to reset"),
    },
    async ({ key, value }) => {
      const setting = await client.setSetting(key, value === undefined ? null : value);
      return json(decode(setting), `Setting '${key}' updated:`);
    }
  );
}
