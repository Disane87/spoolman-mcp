import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { SpoolmanClient } from "../client.js";
import {
  defined,
  encodeExtra,
  extraFiltersSchema,
  extraValuesSchema,
  id,
  idList,
  json,
  limitSchema,
  offsetSchema,
  page,
  prefixExtraFilters,
  sortSchema,
  text,
} from "./util.js";

const multiColorDirection = z
  .enum(["coaxial", "longitudinal"])
  .nullable()
  .optional()
  .describe(
    "Required when multi_color_hexes is set: 'coaxial' (colors side by side in the strand, e.g. silk " +
      "dual/tri-color) or 'longitudinal' (colors change along the length, e.g. rainbow)."
  );

const filamentFields = {
  name: z.string().max(64).optional().describe("Filament name, e.g. 'PolyTerra Charcoal Black'"),
  vendor_id: z.number().int().positive().optional().describe("Vendor ID"),
  material: z.string().max(64).optional().describe("Material type (e.g. PLA, PETG, ABS, TPU)"),
  price: z.number().nonnegative().optional().describe("Price of a full spool, in the configured currency"),
  weight: z.number().positive().optional().describe("Net filament weight of a full spool in grams"),
  spool_weight: z.number().nonnegative().optional().describe("Empty spool weight in grams"),
  article_number: z.string().max(64).optional().describe("Manufacturer article number / EAN"),
  comment: z.string().max(1024).optional().describe("Optional comment"),
  settings_extruder_temp: z.number().int().optional().describe("Recommended extruder temperature in °C"),
  settings_bed_temp: z.number().int().optional().describe("Recommended bed temperature in °C"),
  color_hex: z
    .string()
    .optional()
    .describe("Single color as hex (6 or 8 chars, '#' optional), e.g. FF0000. Do not combine with multi_color_hexes."),
  multi_color_hexes: z
    .string()
    .optional()
    .describe("Two or more comma-separated hex colors for multi-color filaments. Requires multi_color_direction."),
  multi_color_direction: multiColorDirection,
  external_id: z.string().max(256).optional().describe("ID in an external database such as SpoolmanDB"),
  extra: extraValuesSchema,
};

export function registerFilamentTools(server: McpServer, client: SpoolmanClient): void {
  server.tool(
    "spoolman_list_filaments",
    "List and search filament types. Supports filtering by vendor, material, color similarity, tag, custom fields and more.",
    {
      vendor_id: idList("vendor"),
      vendor_name: z.string().optional().describe("Partial case-insensitive match on vendor name"),
      name: z.string().optional().describe("Partial case-insensitive match on filament name"),
      material: z.string().optional().describe("Partial case-insensitive match on material (e.g. PLA)"),
      article_number: z.string().optional().describe("Match on article number"),
      color_hex: z.string().optional().describe("Find filaments with a color similar to this hex code"),
      color_similarity_threshold: z
        .number()
        .min(0)
        .max(100)
        .optional()
        .describe("How close colors must be when color_hex is set (0 = exact, default 20)"),
      external_id: z.string().optional().describe("Match by external (SpoolmanDB) ID"),
      tag: z.string().optional().describe("Find the filament linked to this NFC/RFID tag UID"),
      extra_filters: extraFiltersSchema('"extra.<key>"'),
      sort: sortSchema("vendor.name:asc,name:asc"),
      limit: limitSchema,
      offset: offsetSchema,
    },
    async (params) => {
      const { items, total } = await client.getFilaments({
        ...params,
        extra_filters: prefixExtraFilters(params.extra_filters, ["extra."]),
      });
      return page(items, total, params.offset);
    }
  );

  server.tool("spoolman_get_filament", "Get a single filament by its ID.", { id: id("filament") }, async ({ id }) =>
    json(await client.getFilament(id))
  );

  server.tool(
    "spoolman_create_filament",
    "Create a new filament type. Density and diameter are required. Tip: use spoolman_search_external_filaments " +
      "first to get accurate specs from SpoolmanDB.",
    {
      density: z.number().positive().describe("Filament density in g/cm³ (required, e.g. PLA 1.24, PETG 1.27)"),
      diameter: z.number().positive().describe("Filament diameter in mm (required, e.g. 1.75 or 2.85)"),
      ...filamentFields,
    },
    async ({ extra, ...rest }) => {
      const filament = await client.createFilament({ ...rest, extra: encodeExtra(extra) });
      return json(filament, "Filament created:");
    }
  );

  server.tool(
    "spoolman_update_filament",
    "Update an existing filament by ID. Only provide the fields you want to change. To switch a filament " +
      "between single- and multi-color, set the new color field(s), pass an empty string for the old color field, and (when going to single-color) multi_color_direction: null.",
    {
      id: id("filament"),
      density: z.number().positive().optional().describe("New density in g/cm³"),
      diameter: z.number().positive().optional().describe("New diameter in mm"),
      ...filamentFields,
    },
    async ({ id, extra, ...rest }) => {
      const filament = await client.updateFilament(id, defined({ ...rest, extra: encodeExtra(extra) }));
      return json(filament, "Filament updated:");
    }
  );

  server.tool(
    "spoolman_delete_filament",
    "Delete a filament by ID.",
    { id: id("filament") },
    async ({ id }) => {
      await client.deleteFilament(id);
      return text(`Filament with ID ${id} deleted.`);
    }
  );
}
