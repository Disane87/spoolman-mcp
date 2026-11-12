import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { SpoolmanClient } from "../client.js";
import { defined, json, text } from "./util.js";

const uid = z
  .string()
  .min(1)
  .describe("Tag hardware UID in hex; separators (: - _ space) and case are ignored, e.g. '04:A2:B3:C4:D5:E6:F7'");
const format = z
  .string()
  .max(64)
  .optional()
  .describe("Tag type, informational, e.g. 'ntag', 'mifare_classic', 'openprinttag'");

export function registerTagTools(server: McpServer, client: SpoolmanClient): void {
  server.tool(
    "spoolman_link_tag",
    "Link a physical NFC/RFID tag to a spool or a filament so the tag's UID identifies it. A tag can belong to only " +
      "one spool or filament; if it is already linked elsewhere the error names the current holder.",
    {
      target: z.enum(["spool", "filament"]).describe("What to link the tag to"),
      id: z.number().int().positive().describe("Spool or filament ID"),
      uid,
      format,
    },
    async ({ target, id, uid, format }) => {
      const tag =
        target === "spool" ? await client.linkSpoolTag(id, uid, format) : await client.linkFilamentTag(id, uid, format);
      return json(tag, `Tag linked to ${target} ${id}:`);
    }
  );

  server.tool(
    "spoolman_unlink_tag",
    "Unlink an NFC/RFID tag from a spool or filament.",
    {
      target: z.enum(["spool", "filament"]).describe("What the tag is linked to"),
      id: z.number().int().positive().describe("Spool or filament ID"),
      uid,
    },
    async ({ target, id, uid }) => {
      if (target === "spool") await client.unlinkSpoolTag(id, uid);
      else await client.unlinkFilamentTag(id, uid);
      return text(`Tag ${uid} unlinked from ${target} ${id}.`);
    }
  );

  server.tool(
    "spoolman_scan_tag",
    "Report an NFC/RFID tag scan to Spoolman: resolves the UID to the linked spool or filament and broadcasts the " +
      "scan to open Spoolman browser tabs paired with the reader. With format + payload_b64 for a known format " +
      "(e.g. OpenPrintTag) the contents are decoded; create=true additionally creates and links a new spool from " +
      "the decoded data when the tag is unlinked. To just look up a tag without broadcasting, use " +
      "spoolman_list_spools / spoolman_list_filaments with the tag filter instead.",
    {
      uid,
      reader_id: z
        .string()
        .optional()
        .describe("Stable reader id (e.g. hostname) that browser tabs subscribe to; derived from the IP if omitted"),
      name: z.string().max(64).optional().describe("Human-readable reader name"),
      format,
      payload_b64: z.string().max(8192).optional().describe("Raw tag contents, base64-encoded"),
      create: z.boolean().optional().describe("Create a spool from decoded contents if the tag is unlinked (default false)"),
    },
    async (params) => json(await client.scanTag(defined(params) as typeof params))
  );

  server.tool(
    "spoolman_list_tag_readers",
    "List NFC/RFID readers that have reported a scan recently (in-memory, cleared on Spoolman restart).",
    {},
    async () => json(await client.getTagReaders())
  );
}
