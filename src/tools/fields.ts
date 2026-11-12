import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { SpoolmanClient } from "../client.js";
import { json } from "./util.js";

const entityTypeEnum = z.enum(["vendor", "filament", "spool"]).describe("The entity type: 'vendor', 'filament', or 'spool'");
const fieldKey = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-z0-9_]+$/, "Keys may only contain lowercase letters, digits and underscores")
  .describe("The field key (lowercase letters, digits, underscores)");

export function registerFieldTools(server: McpServer, client: SpoolmanClient): void {
  server.tool(
    "spoolman_list_fields",
    "List all custom extra fields defined for a given entity type (vendor, filament, or spool).",
    { entity_type: entityTypeEnum },
    async ({ entity_type }) => json(await client.getFields(entity_type))
  );

  server.tool(
    "spoolman_list_field_values",
    "List the distinct values currently stored for one custom field (useful for text and choice fields).",
    { entity_type: entityTypeEnum, key: fieldKey },
    async ({ entity_type, key }) => json(await client.getFieldValues(entity_type, key))
  );

  server.tool(
    "spoolman_upsert_field",
    "Add or update a custom extra field for an entity type. The field type cannot be changed once created. " +
      "Returns the full list of fields for that entity type.",
    {
      entity_type: entityTypeEnum,
      key: fieldKey,
      name: z.string().min(1).max(128).describe("Display name for the field (required)"),
      field_type: z
        .enum(["text", "integer", "integer_range", "float", "float_range", "datetime", "boolean", "choice"])
        .describe("Data type of the field"),
      order: z.number().int().optional().describe("Display order (default 0)"),
      unit: z.string().min(1).max(16).optional().describe("Unit of measurement (e.g. mm, g)"),
      default_value: z
        .unknown()
        .optional()
        .describe("Default value as a plain value (e.g. 5, \"abc\", true, [1,2]); it is JSON-encoded automatically"),
      choices: z.array(z.string()).min(1).optional().describe("Available choices (field_type 'choice' only)"),
      multi_choice: z.boolean().optional().describe("Allow selecting multiple choices (field_type 'choice' only)"),
    },
    async ({ entity_type, key, default_value, ...rest }) => {
      const fields = await client.upsertField(entity_type, key, {
        ...rest,
        default_value: default_value === undefined || default_value === null ? undefined : JSON.stringify(default_value),
      });
      return json(fields, `Custom field '${key}' saved. Fields for ${entity_type}:`);
    }
  );

  server.tool(
    "spoolman_delete_field",
    "Remove a custom extra field (and all stored values for it) from an entity type.",
    { entity_type: entityTypeEnum, key: fieldKey },
    async ({ entity_type, key }) =>
      json(await client.deleteField(entity_type, key), `Custom field '${key}' removed from ${entity_type}. Remaining fields:`)
  );
}
