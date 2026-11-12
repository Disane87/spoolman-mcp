import { z } from "zod";
import { ExtraValues } from "../client.js";

export type ToolResult = { content: { type: "text"; text: string }[] };

/** Plain-text tool result. */
export function text(message: string): ToolResult {
  return { content: [{ type: "text", text: message }] };
}

/** JSON tool result, optionally prefixed with a short message. */
export function json(data: unknown, message?: string): ToolResult {
  const body = JSON.stringify(data, null, 2);
  return text(message ? `${message}\n${body}` : body);
}

/** A list result that also reports the total match count, so the model knows whether it saw everything. */
export function page(items: unknown[], total: number | null, offset = 0): ToolResult {
  const shown = items.length;
  const summary =
    total == null
      ? `${shown} result(s).`
      : shown < total
        ? `Showing ${shown} of ${total} result(s) (offset ${offset}). Use limit/offset to page.`
        : `${total} result(s).`;
  return json(items, summary);
}

export const id = (what: string) => z.number().int().positive().describe(`The ${what} ID`);

/** Comma-separated ID list accepted by Spoolman's filter params, e.g. "1,2,3". -1 matches "none". */
export const idList = (what: string) =>
  z
    .union([z.number().int(), z.string().regex(/^-?\d+(,-?\d+)*$/)])
    .transform((v) => String(v))
    .optional()
    .describe(`Filter by ${what} ID. A single ID or a comma-separated list, e.g. "1,4".`);

export const extraValuesSchema = z
  .record(z.string(), z.unknown())
  .optional()
  .describe(
    "Custom (extra) field values keyed by field key. Pass plain values (text, number, boolean, " +
      "[min,max] for ranges, ISO string for datetimes, array for multi-choice); they are JSON-encoded " +
      "for Spoolman automatically. Pass null to clear a value. Updates merge per key. " +
      "Use spoolman_list_fields to see which keys exist."
  );

/** Convert friendly extra values into Spoolman's JSON-encoded-string map. */
export function encodeExtra(extra: Record<string, unknown> | undefined): ExtraValues | undefined {
  if (!extra) return undefined;
  const out: ExtraValues = {};
  for (const [key, value] of Object.entries(extra)) {
    out[key] = value === null ? null : JSON.stringify(value);
  }
  return out;
}

export const extraFiltersSchema = (prefixes: string) =>
  z
    .record(z.string(), z.string())
    .optional()
    .describe(
      `Filter by custom field values. Keys are the full filter name: ${prefixes}. ` +
        "Values use Spoolman's filter grammar: partial case-insensitive match for text, comma-separated " +
        'for OR, quotes for exact match, empty string for "not set", "<start>|<end>" for ranges.'
    );

export function prefixExtraFilters(filters: Record<string, string> | undefined, allowed: string[]) {
  if (!filters) return undefined;
  for (const key of Object.keys(filters)) {
    if (!allowed.some((p) => key.startsWith(p))) {
      throw new Error(`Invalid extra filter key '${key}'. It must start with one of: ${allowed.join(", ")}`);
    }
  }
  return filters;
}

export const dateRange = (field: string) =>
  z
    .string()
    .optional()
    .describe(
      `Filter by ${field} timestamp: "<start>|<end>" (ISO 8601, either end may be omitted), a bare ` +
        `timestamp for an exact match, or "" for spools with no ${field}. Comma-separate to OR.`
    );

export const sortSchema = (example: string) =>
  z.string().optional().describe(`Sort expression: comma-separated "field:asc|desc" items, e.g. '${example}'`);

export const limitSchema = z.number().int().positive().optional().describe("Maximum number of results");
export const offsetSchema = z.number().int().min(0).optional().describe("Pagination offset");

/** Drop keys whose value is undefined so PATCH requests only touch what the caller set. */
export function defined<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as Partial<T>;
}
