import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { SpoolmanClient } from "../client.js";
import {
  dateRange,
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

export const SPOOL_EXTRA_PREFIXES = ["extra.", "filament.extra.", "filament.vendor.extra."];

/** Filters shared by spoolman_list_spools and spoolman_group_spools. */
export const spoolFilterSchema = {
  filament_name: z.string().optional().describe("Partial case-insensitive match on filament name"),
  filament_id: idList("filament"),
  filament_material: z.string().optional().describe("Partial case-insensitive match on material (e.g. PLA)"),
  filament_multi_color_direction: z
    .string()
    .optional()
    .describe("'coaxial' or 'longitudinal'; empty string matches single-color filaments"),
  vendor_name: z.string().optional().describe("Partial case-insensitive match on vendor name"),
  vendor_id: idList("vendor (-1 = filaments with no vendor)"),
  location: z.string().optional().describe("Partial case-insensitive match on storage location"),
  lot_nr: z.string().optional().describe("Partial case-insensitive match on lot/batch number"),
  allow_archived: z.boolean().optional().describe("Include archived spools (default false)"),
  first_used: dateRange("first_used"),
  last_used: dateRange("last_used"),
  registered: dateRange("registered"),
  extra_filters: extraFiltersSchema('"extra.<key>" (spool), "filament.extra.<key>", "filament.vendor.extra.<key>"'),
};

const spoolFields = {
  price: z.number().nonnegative().optional().describe("Price paid for this spool (overrides the filament price)"),
  initial_weight: z.number().nonnegative().optional().describe("Initial net filament weight in grams"),
  spool_weight: z.number().nonnegative().optional().describe("Empty spool (tare) weight in grams"),
  remaining_weight: z
    .number()
    .nonnegative()
    .optional()
    .describe("Remaining filament weight in grams. Needs initial_weight or a filament weight. Exclusive with used_weight."),
  used_weight: z.number().nonnegative().optional().describe("Already used weight in grams. Exclusive with remaining_weight."),
  first_used: z.string().optional().describe("First use timestamp (ISO 8601)"),
  last_used: z.string().optional().describe("Last use timestamp (ISO 8601)"),
  location: z.string().max(64).optional().describe("Storage location"),
  lot_nr: z.string().max(64).optional().describe("Lot/batch number"),
  comment: z.string().max(1024).optional().describe("Optional comment"),
  archived: z.boolean().optional().describe("Whether the spool is archived (used up / retired)"),
  extra: extraValuesSchema,
};

export function registerSpoolTools(server: McpServer, client: SpoolmanClient): void {
  server.tool(
    "spoolman_list_spools",
    "List and search individual spools. Filter by filament, vendor, material, location, lot, dates, tag and " +
      "custom fields. For totals (e.g. 'how much PLA do I have') prefer spoolman_group_spools.",
    {
      ...spoolFilterSchema,
      tag: z.string().optional().describe("Find the spool linked to this NFC/RFID tag UID"),
      sort: sortSchema("remaining_weight:desc"),
      limit: limitSchema,
      offset: offsetSchema,
    },
    async (params) => {
      const { items, total } = await client.getSpools({
        ...params,
        extra_filters: prefixExtraFilters(params.extra_filters, SPOOL_EXTRA_PREFIXES),
      });
      return page(items, total, params.offset);
    }
  );

  server.tool(
    "spoolman_get_spool",
    "Get a single spool by its ID, including remaining weight and usage stats.",
    { id: id("spool") },
    async ({ id }) => json(await client.getSpool(id))
  );

  server.tool(
    "spoolman_create_spool",
    "Create a new spool of an existing filament. Specify either remaining_weight or used_weight (not both).",
    {
      filament_id: z.number().int().positive().describe("Filament ID (required)"),
      ...spoolFields,
    },
    async ({ extra, ...rest }) => {
      if (rest.remaining_weight !== undefined && rest.used_weight !== undefined) {
        throw new Error("Specify either remaining_weight or used_weight, not both.");
      }
      const spool = await client.createSpool({ ...rest, extra: encodeExtra(extra) });
      return json(spool, "Spool created:");
    }
  );

  server.tool(
    "spoolman_update_spool",
    "Update an existing spool by ID. Only provide the fields you want to change. remaining_weight and " +
      "used_weight are mutually exclusive.",
    {
      id: id("spool"),
      filament_id: z.number().int().positive().optional().describe("New filament ID"),
      ...spoolFields,
    },
    async ({ id, extra, ...rest }) => {
      if (rest.remaining_weight !== undefined && rest.used_weight !== undefined) {
        throw new Error("Specify either remaining_weight or used_weight, not both.");
      }
      const spool = await client.updateSpool(id, defined({ ...rest, extra: encodeExtra(extra) }));
      return json(spool, "Spool updated:");
    }
  );

  server.tool(
    "spoolman_delete_spool",
    "Permanently delete a spool by ID. To retire a used-up spool, prefer archiving it with spoolman_update_spool.",
    { id: id("spool") },
    async ({ id }) => {
      await client.deleteSpool(id);
      return text(`Spool with ID ${id} deleted.`);
    }
  );

  server.tool(
    "spoolman_use_spool",
    "Log filament consumption for a spool. Provide exactly one of use_length (mm) or use_weight (g).",
    {
      id: id("spool"),
      use_length: z.number().positive().optional().describe("Amount of filament used in millimeters"),
      use_weight: z.number().positive().optional().describe("Amount of filament used in grams"),
    },
    async ({ id, use_length, use_weight }) => {
      if ((use_length === undefined) === (use_weight === undefined)) {
        throw new Error("Provide exactly one of use_length or use_weight.");
      }
      const spool = await client.useSpool(id, { use_length, use_weight });
      return json(
        spool,
        `Usage logged. Remaining: ${spool.remaining_weight ?? "unknown"} g, used: ${spool.used_weight} g.`
      );
    }
  );

  server.tool(
    "spoolman_measure_spool",
    "Update a spool's remaining filament from a scale reading of the whole spool (filament + empty spool, in grams).",
    {
      id: id("spool"),
      weight: z.number().nonnegative().describe("Current gross weight of spool + filament in grams"),
    },
    async ({ id, weight }) => {
      const spool = await client.measureSpool(id, { weight });
      return json(spool, `Measurement recorded. Remaining: ${spool.remaining_weight ?? "unknown"} g.`);
    }
  );

  server.tool(
    "spoolman_rename_spool_field_value",
    "Replace one value of a spool field on every spool that has it (archived included), e.g. rename location " +
      "'Shelf A' to 'Shelf B', or a custom field value. Renaming onto an existing value merges them.",
    {
      field: z
        .string()
        .min(1)
        .describe("'location' or 'extra.<key>' for a custom text/single-choice spool field"),
      value: z.string().min(1).describe("The current value"),
      new_value: z.string().min(1).describe("The replacement value"),
    },
    async ({ field, value, new_value }) => {
      const result = await client.renameSpoolFieldValue(field, value, new_value);
      return text(`Renamed ${field} '${value}' → '${new_value}' on ${result.spools_updated} spool(s).`);
    }
  );
}
