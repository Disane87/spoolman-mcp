import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { SpoolmanClient } from "../client.js";

export function registerSpoolTools(server: McpServer, client: SpoolmanClient): void {
  // ── GET /spool ───────────────────────────────
  server.tool(
    "spoolman_list_spools",
    "List and search spools in Spoolman. Filter by filament, vendor, material, location, lot number and more.",
    {
      filament_name: z.string().optional().describe("Filter by filament name"),
      filament_id: z.number().int().positive().optional().describe("Filter by filament ID"),
      filament_material: z.string().optional().describe("Filter by filament material (e.g. PLA)"),
      vendor_name: z.string().optional().describe("Filter by vendor name"),
      vendor_id: z.number().int().positive().optional().describe("Filter by vendor ID"),
      location: z.string().optional().describe("Filter by spool storage location"),
      lot_nr: z.string().optional().describe("Filter by lot/batch number"),
      allow_archived: z.boolean().optional().describe("Include archived spools (default: false)"),
      sort: z.string().optional().describe("Sort expression, e.g. 'remaining_weight:desc'"),
      limit: z.number().int().positive().optional().describe("Maximum number of results"),
      offset: z.number().int().min(0).optional().describe("Pagination offset"),
    },
    async (params) => {
      const spools = await client.getSpools(params);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(spools, null, 2),
          },
        ],
      };
    }
  );

  // ── GET /spool/{id} ──────────────────────────
  server.tool(
    "spoolman_get_spool",
    "Get a single spool by its ID, including remaining weight and usage stats.",
    {
      id: z.number().int().positive().describe("The spool ID"),
    },
    async ({ id }) => {
      const spool = await client.getSpool(id);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(spool, null, 2),
          },
        ],
      };
    }
  );

  // ── POST /spool ──────────────────────────────
  server.tool(
    "spoolman_create_spool",
    "Create a new spool in Spoolman. A filament_id is required. Specify either remaining_weight or used_weight (not both).",
    {
      filament_id: z.number().int().positive().describe("Filament ID (required)"),
      remaining_weight: z.number().nonnegative().optional().describe("Remaining filament weight in grams"),
      used_weight: z.number().nonnegative().optional().describe("Already used weight in grams"),
      initial_weight: z.number().nonnegative().optional().describe("Initial net weight of filament in grams"),
      spool_weight: z.number().nonnegative().optional().describe("Empty spool weight in grams"),
      first_used: z.string().optional().describe("First use timestamp (ISO 8601)"),
      last_used: z.string().optional().describe("Last use timestamp (ISO 8601)"),
      location: z.string().optional().describe("Storage location"),
      lot_nr: z.string().optional().describe("Lot/batch number"),
      comment: z.string().optional().describe("Optional comment"),
      archived: z.boolean().optional().describe("Whether the spool is archived"),
    },
    async (params) => {
      const spool = await client.createSpool(params);
      return {
        content: [
          {
            type: "text",
            text: `Spool created successfully:\n${JSON.stringify(spool, null, 2)}`,
          },
        ],
      };
    }
  );

  // ── PATCH /spool/{id} ────────────────────────
  server.tool(
    "spoolman_update_spool",
    "Update an existing spool by ID. Only provide the fields you want to change. remaining_weight and used_weight are mutually exclusive.",
    {
      id: z.number().int().positive().describe("The spool ID"),
      filament_id: z.number().int().positive().optional().describe("New filament ID"),
      remaining_weight: z.number().nonnegative().optional().describe("New remaining weight in grams"),
      used_weight: z.number().nonnegative().optional().describe("New used weight in grams"),
      location: z.string().optional().describe("New storage location"),
      lot_nr: z.string().optional().describe("New lot/batch number"),
      comment: z.string().optional().describe("New comment"),
      archived: z.boolean().optional().describe("Archive/unarchive the spool"),
      first_used: z.string().optional().describe("First use timestamp (ISO 8601)"),
      last_used: z.string().optional().describe("Last use timestamp (ISO 8601)"),
    },
    async ({ id, ...payload }) => {
      const spool = await client.updateSpool(id, payload);
      return {
        content: [
          {
            type: "text",
            text: `Spool updated successfully:\n${JSON.stringify(spool, null, 2)}`,
          },
        ],
      };
    }
  );

  // ── DELETE /spool/{id} ───────────────────────
  server.tool(
    "spoolman_delete_spool",
    "Delete a spool by ID.",
    {
      id: z.number().int().positive().describe("The spool ID"),
    },
    async ({ id }) => {
      await client.deleteSpool(id);
      return {
        content: [
          {
            type: "text",
            text: `Spool with ID ${id} deleted successfully.`,
          },
        ],
      };
    }
  );

  // ── PUT /spool/{id}/use ──────────────────────
  server.tool(
    "spoolman_use_spool",
    "Log filament consumption for a spool. Provide either use_length (mm) or use_weight (g), not both.",
    {
      id: z.number().int().positive().describe("The spool ID"),
      use_length: z.number().positive().optional().describe("Amount of filament used in millimeters"),
      use_weight: z.number().positive().optional().describe("Amount of filament used in grams"),
    },
    async ({ id, use_length, use_weight }) => {
      const spool = await client.useSpool(id, { use_length, use_weight });
      return {
        content: [
          {
            type: "text",
            text: `Filament usage logged.\nRemaining weight: ${spool.remaining_weight ?? "unknown"} g\nUsed weight: ${spool.used_weight} g\n\nFull spool:\n${JSON.stringify(spool, null, 2)}`,
          },
        ],
      };
    }
  );

  // ── PUT /spool/{id}/measure ──────────────────
  server.tool(
    "spoolman_measure_spool",
    "Update a spool's remaining filament by providing a current weight measurement (spool + filament together in grams).",
    {
      id: z.number().int().positive().describe("The spool ID"),
      weight: z.number().nonnegative().describe("Current measured weight of spool + filament in grams"),
    },
    async ({ id, weight }) => {
      const spool = await client.measureSpool(id, { weight });
      return {
        content: [
          {
            type: "text",
            text: `Spool weight measurement recorded.\nRemaining weight: ${spool.remaining_weight ?? "unknown"} g\n\nFull spool:\n${JSON.stringify(spool, null, 2)}`,
          },
        ],
      };
    }
  );
}
