import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { SpoolmanClient, EntityType } from "../client.js";

const entityTypeEnum = z.enum(["vendor", "filament", "spool"]);

export function registerFieldTools(server: McpServer, client: SpoolmanClient): void {
  // ── GET /field/{entity_type} ─────────────────
  server.tool(
    "spoolman_list_fields",
    "List all custom extra fields defined for a given entity type (vendor, filament, or spool).",
    {
      entity_type: entityTypeEnum.describe("The entity type: 'vendor', 'filament', or 'spool'"),
    },
    async ({ entity_type }) => {
      const fields = await client.getFields(entity_type as EntityType);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(fields, null, 2),
          },
        ],
      };
    }
  );

  // ── POST /field/{entity_type}/{key} ──────────
  server.tool(
    "spoolman_upsert_field",
    "Add or update a custom extra field for a given entity type.",
    {
      entity_type: entityTypeEnum.describe("The entity type: 'vendor', 'filament', or 'spool'"),
      key: z.string().min(1).describe("The field key (used as identifier)"),
      name: z.string().optional().describe("Display name for the field"),
      order: z.number().int().min(0).describe("Display order"),
      unit: z.string().optional().describe("Unit of measurement (e.g. mm, g)"),
      field_type: z
        .enum(["text", "integer", "integer_range", "float", "float_range", "datetime", "boolean", "choice"])
        .describe("Data type of the field"),
      default_value: z.unknown().optional().describe("Default value for the field"),
      choices: z
        .array(z.string())
        .optional()
        .describe("Available choices (only for field_type='choice')"),
    },
    async ({ entity_type, key, ...fieldData }) => {
      const field = await client.upsertField(entity_type as EntityType, key, fieldData as Parameters<SpoolmanClient["upsertField"]>[2]);
      return {
        content: [
          {
            type: "text",
            text: `Custom field '${key}' saved:\n${JSON.stringify(field, null, 2)}`,
          },
        ],
      };
    }
  );

  // ── DELETE /field/{entity_type}/{key} ────────
  server.tool(
    "spoolman_delete_field",
    "Remove a custom extra field from an entity type.",
    {
      entity_type: entityTypeEnum.describe("The entity type: 'vendor', 'filament', or 'spool'"),
      key: z.string().min(1).describe("The field key to delete"),
    },
    async ({ entity_type, key }) => {
      await client.deleteField(entity_type as EntityType, key);
      return {
        content: [
          {
            type: "text",
            text: `Custom field '${key}' removed from ${entity_type}.`,
          },
        ],
      };
    }
  );
}
