import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { SpoolmanClient } from "../client.js";

export function registerFilamentTools(server: McpServer, client: SpoolmanClient): void {
  // ── GET /filament ────────────────────────────
  server.tool(
    "spoolman_list_filaments",
    "List and search filaments in Spoolman. Supports filtering by vendor, material, color, article number and more.",
    {
      vendor_id: z.number().int().positive().optional().describe("Filter by vendor ID"),
      vendor_name: z.string().optional().describe("Filter by vendor name"),
      name: z.string().optional().describe("Filter by filament name"),
      material: z.string().optional().describe("Filter by material type (e.g. PLA, PETG, ABS)"),
      article_number: z.string().optional().describe("Filter by article number"),
      color_hex: z.string().optional().describe("Filter by color hex code (without #)"),
      external_id: z.string().optional().describe("Filter by external ID"),
      sort: z.string().optional().describe("Sort expression, e.g. 'name:asc'"),
      limit: z.number().int().positive().optional().describe("Maximum number of results"),
      offset: z.number().int().min(0).optional().describe("Pagination offset"),
    },
    async (params) => {
      const filaments = await client.getFilaments(params);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(filaments, null, 2),
          },
        ],
      };
    }
  );

  // ── GET /filament/{id} ───────────────────────
  server.tool(
    "spoolman_get_filament",
    "Get a single filament by its ID.",
    {
      id: z.number().int().positive().describe("The filament ID"),
    },
    async ({ id }) => {
      const filament = await client.getFilament(id);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(filament, null, 2),
          },
        ],
      };
    }
  );

  // ── POST /filament ───────────────────────────
  server.tool(
    "spoolman_create_filament",
    "Create a new filament definition in Spoolman. Density and diameter are required.",
    {
      density: z.number().positive().describe("Filament density in g/cm³ (required)"),
      diameter: z.number().positive().describe("Filament diameter in mm (required, e.g. 1.75 or 2.85)"),
      name: z.string().optional().describe("Filament name"),
      vendor_id: z.number().int().positive().optional().describe("Vendor ID"),
      material: z.string().optional().describe("Material type (e.g. PLA, PETG, ABS, TPU)"),
      price: z.number().nonnegative().optional().describe("Price per spool"),
      weight: z.number().positive().optional().describe("Net weight in grams (filament only, without spool)"),
      spool_weight: z.number().positive().optional().describe("Empty spool weight in grams"),
      article_number: z.string().optional().describe("Manufacturer article number"),
      comment: z.string().optional().describe("Optional comment"),
      settings_extruder_temp: z.number().int().optional().describe("Recommended extruder temperature in °C"),
      settings_bed_temp: z.number().int().optional().describe("Recommended bed temperature in °C"),
      color_hex: z.string().optional().describe("Color as hex string (without #), e.g. FF0000 for red"),
      multi_color_hexes: z.string().optional().describe("Comma-separated hex colors for multi-color filaments"),
      external_id: z.string().optional().describe("External database ID"),
    },
    async (params) => {
      const filament = await client.createFilament(params);
      return {
        content: [
          {
            type: "text",
            text: `Filament created successfully:\n${JSON.stringify(filament, null, 2)}`,
          },
        ],
      };
    }
  );

  // ── PATCH /filament/{id} ─────────────────────
  server.tool(
    "spoolman_update_filament",
    "Update an existing filament by ID. Only provide the fields you want to change.",
    {
      id: z.number().int().positive().describe("The filament ID"),
      name: z.string().optional().describe("New filament name"),
      vendor_id: z.number().int().positive().optional().describe("New vendor ID"),
      material: z.string().optional().describe("New material type"),
      price: z.number().nonnegative().optional().describe("New price"),
      density: z.number().positive().optional().describe("New density in g/cm³"),
      diameter: z.number().positive().optional().describe("New diameter in mm"),
      weight: z.number().positive().optional().describe("New net weight in grams"),
      spool_weight: z.number().positive().optional().describe("New empty spool weight in grams"),
      article_number: z.string().optional().describe("New article number"),
      comment: z.string().optional().describe("New comment"),
      settings_extruder_temp: z.number().int().optional().describe("New extruder temperature"),
      settings_bed_temp: z.number().int().optional().describe("New bed temperature"),
      color_hex: z.string().optional().describe("New color hex (without #)"),
    },
    async ({ id, ...payload }) => {
      const filament = await client.updateFilament(id, payload);
      return {
        content: [
          {
            type: "text",
            text: `Filament updated successfully:\n${JSON.stringify(filament, null, 2)}`,
          },
        ],
      };
    }
  );

  // ── DELETE /filament/{id} ────────────────────
  server.tool(
    "spoolman_delete_filament",
    "Delete a filament by ID.",
    {
      id: z.number().int().positive().describe("The filament ID"),
    },
    async ({ id }) => {
      await client.deleteFilament(id);
      return {
        content: [
          {
            type: "text",
            text: `Filament with ID ${id} deleted successfully.`,
          },
        ],
      };
    }
  );
}
