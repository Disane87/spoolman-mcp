#!/usr/bin/env node
/**
 * Spoolman MCP Server
 *
 * A Model Context Protocol server that exposes the full Spoolman REST API
 * as MCP tools, enabling AI assistants to manage your 3D printer filament
 * inventory through natural language.
 *
 * Usage:
 *   SPOOLMAN_URL=http://localhost:7912 node dist/index.js
 *
 * Or with an API key (if Spoolman is behind a reverse proxy):
 *   SPOOLMAN_URL=http://localhost:7912 SPOOLMAN_API_KEY=your-key node dist/index.js
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SpoolmanClient } from "./client.js";
import { registerSystemTools } from "./tools/system.js";
import { registerVendorTools } from "./tools/vendors.js";
import { registerFilamentTools } from "./tools/filaments.js";
import { registerSpoolTools } from "./tools/spools.js";
import { registerSettingsTools } from "./tools/settings.js";
import { registerFieldTools } from "./tools/fields.js";
import { registerLookupTools } from "./tools/lookup.js";
import { registerExportTools } from "./tools/export.js";

// ─────────────────────────────────────────────
//  Configuration
// ─────────────────────────────────────────────

const SPOOLMAN_URL = process.env.SPOOLMAN_URL;
const SPOOLMAN_API_KEY = process.env.SPOOLMAN_API_KEY;

if (!SPOOLMAN_URL) {
  console.error(
    "❌  Environment variable SPOOLMAN_URL is required.\n" +
    "    Example: SPOOLMAN_URL=http://localhost:7912"
  );
  process.exit(1);
}

// ─────────────────────────────────────────────
//  Server Setup
// ─────────────────────────────────────────────

const server = new McpServer({
  name: "spoolman-mcp",
  version: "1.0.0",
});

const client = new SpoolmanClient(SPOOLMAN_URL, SPOOLMAN_API_KEY);

// Register all tool groups
registerSystemTools(server, client);
registerVendorTools(server, client);
registerFilamentTools(server, client);
registerSpoolTools(server, client);
registerSettingsTools(server, client);
registerFieldTools(server, client);
registerLookupTools(server, client);
registerExportTools(server, client);

// ─────────────────────────────────────────────
//  Transport & Start
// ─────────────────────────────────────────────

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("🧵  Spoolman MCP Server running on stdio");
  console.error(`📡  Connected to Spoolman at: ${SPOOLMAN_URL}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
