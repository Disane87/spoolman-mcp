# 🧵 Spoolman MCP Server

[![Version](https://img.shields.io/badge/version-1.0.0-blue?style=flat-square)](https://github.com/Disane87/spoolman-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![MCP](https://img.shields.io/badge/MCP-1.0-purple?style=flat-square)](https://modelcontextprotocol.io/)
[![Spoolman](https://img.shields.io/badge/Spoolman-compatible-green?style=flat-square)](https://github.com/Donkie/Spoolman)

> **A [Model Context Protocol](https://modelcontextprotocol.io/) server for [Spoolman](https://github.com/Donkie/Spoolman) — manage your entire 3D printer filament inventory through natural language with Claude and other AI assistants!** 🎉

---

## 🚀 What is this?

This MCP server bridges the gap between AI assistants (like Claude) and your self-hosted [Spoolman](https://github.com/Donkie/Spoolman) instance. Instead of clicking through the Spoolman UI, you can simply **ask** your AI assistant:

> _"How much PLA do I have left?"_
> _"Add a new Bambu Lab PETG spool, 1kg, red."_
> _"Mark spool #12 as used by 50g."_

The server exposes the **full Spoolman REST API v1** as MCP tools — every vendor, filament, spool, setting, custom field, lookup, and export endpoint is covered.

---

## ✨ Features

- 🏭 **Vendor Management** — Create, read, update, delete vendors
- 🎨 **Filament Management** — Full CRUD with color, temperature settings, article numbers
- 🧵 **Spool Management** — Track spools, log usage (by weight or length), weight measurement, archiving
- ⚙️ **Settings** — Read and write Spoolman configuration
- 🏷️ **Custom Fields** — Manage extra fields for vendors, filaments, and spools
- 🔍 **Lookups** — Browse all materials, locations, lot numbers, article numbers
- 📦 **Export** — Export data as JSON or CSV
- 💓 **System** — Health check, info, and backup trigger

> [!NOTE]
> This server communicates with your **local/self-hosted** Spoolman instance. You need a running Spoolman before using this MCP server.

---

## 📋 Requirements

| Requirement | Version |
|---|---|
| Node.js | ≥ 18 |
| npm | ≥ 9 |
| Spoolman | Any recent version |
| Claude Desktop / Claude Code | Any |

---

## ⚡ Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/Disane87/spoolman-mcp.git
cd spoolman-mcp
npm install
npm run build
```

### 2. Configure Claude Desktop

Add the following to your `claude_desktop_config.json`:

**macOS / Linux:** `~/.config/claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "spoolman": {
      "command": "node",
      "args": ["/absolute/path/to/spoolman-mcp/dist/index.js"],
      "env": {
        "SPOOLMAN_URL": "http://localhost:7912"
      }
    }
  }
}
```

> [!IMPORTANT]
> Replace `/absolute/path/to/spoolman-mcp` with the actual path where you cloned the repository, and `http://localhost:7912` with the URL of your Spoolman instance.

### 3. Restart Claude Desktop & Start Chatting! 🎉

---

## 🔧 Configuration

The server is configured via **environment variables**:

| Variable | Required | Description | Example |
|---|---|---|---|
| `SPOOLMAN_URL` | ✅ Yes | Base URL of your Spoolman instance | `http://localhost:7912` |
| `SPOOLMAN_API_KEY` | ❌ No | Bearer token (if behind a proxy with auth) | `my-secret-key` |

---

## 🛠️ Available MCP Tools

### 🏭 Vendors

| Tool | Description |
|---|---|
| `spoolman_list_vendors` | Search and list all vendors |
| `spoolman_get_vendor` | Get a single vendor by ID |
| `spoolman_create_vendor` | Create a new vendor |
| `spoolman_update_vendor` | Update an existing vendor |
| `spoolman_delete_vendor` | Delete a vendor (cascades to filaments!) |

### 🎨 Filaments

| Tool | Description |
|---|---|
| `spoolman_list_filaments` | Search filaments by name, material, color, vendor... |
| `spoolman_get_filament` | Get a single filament by ID |
| `spoolman_create_filament` | Create a new filament definition |
| `spoolman_update_filament` | Update an existing filament |
| `spoolman_delete_filament` | Delete a filament |

### 🧵 Spools

| Tool | Description |
|---|---|
| `spoolman_list_spools` | Search spools with extensive filters |
| `spoolman_get_spool` | Get a single spool by ID |
| `spoolman_create_spool` | Register a new spool |
| `spoolman_update_spool` | Update spool metadata |
| `spoolman_delete_spool` | Delete a spool |
| `spoolman_use_spool` | Log filament consumption (g or mm) |
| `spoolman_measure_spool` | Update remaining weight via scale measurement |

### ⚙️ Settings

| Tool | Description |
|---|---|
| `spoolman_get_all_settings` | Get all Spoolman settings |
| `spoolman_get_setting` | Get a specific setting by key |
| `spoolman_set_setting` | Change a setting value |

### 🏷️ Custom Fields

| Tool | Description |
|---|---|
| `spoolman_list_fields` | List custom fields for an entity type |
| `spoolman_upsert_field` | Add or update a custom field |
| `spoolman_delete_field` | Remove a custom field |

### 🔍 Lookups

| Tool | Description |
|---|---|
| `spoolman_list_materials` | List all known material types |
| `spoolman_list_locations` | List all storage locations |
| `spoolman_list_lot_numbers` | List all lot/batch numbers |
| `spoolman_list_article_numbers` | List all article numbers |
| `spoolman_rename_location` | Rename a storage location |

### 📦 Export

| Tool | Description |
|---|---|
| `spoolman_export_spools` | Export all spools as JSON or CSV |
| `spoolman_export_filaments` | Export all filaments as JSON or CSV |
| `spoolman_export_vendors` | Export all vendors as JSON or CSV |

### 💓 System

| Tool | Description |
|---|---|
| `spoolman_get_info` | Get Spoolman version and config info |
| `spoolman_health_check` | Check if Spoolman is reachable |
| `spoolman_trigger_backup` | Trigger a database backup (SQLite only) |

---

## 💬 Example Conversations

Once connected, you can have natural conversations like:

```
You: How many spools do I currently have?

Claude: You have 14 spools in Spoolman. 3 of them are archived.
        The active spools include 5x PLA, 4x PETG, and 2x ABS.
```

```
You: Add a new Bambu Lab PLA Basic spool. It's red, 1kg, 1.75mm.

Claude: I'll create that for you right away!
        ✅ Spool created: Bambu Lab PLA Basic (Red) — 1000g remaining.
```

```
You: I just printed something and used about 45g from spool #7.

Claude: Done! Spool #7 now has 623g remaining (was 668g).
```

```
You: I just weighed spool #3 on my kitchen scale — it's 312g total.

Claude: Got it! Based on the empty spool weight of 190g, spool #3
        now shows 122g of filament remaining.
```

---

## 🏗️ Project Structure

```
spoolman-mcp/
├── src/
│   ├── index.ts          # MCP server entry point & transport
│   ├── client.ts         # Typed Spoolman REST API client
│   └── tools/
│       ├── system.ts     # System tools (health, info, backup)
│       ├── vendors.ts    # Vendor CRUD tools
│       ├── filaments.ts  # Filament CRUD tools
│       ├── spools.ts     # Spool management tools
│       ├── settings.ts   # Settings tools
│       ├── fields.ts     # Custom field tools
│       ├── lookup.ts     # Lookup / discovery tools
│       └── export.ts     # Data export tools
├── dist/                 # Compiled JavaScript (after npm run build)
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔨 Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Watch mode (auto-rebuild on changes)
npm run watch

# Run directly with ts-node (no build step)
SPOOLMAN_URL=http://localhost:7912 npm run dev
```

---

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or pull request if you find a bug, have a feature idea, or want to improve the documentation.

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Commit your changes (`git commit -m 'feat: add my feature'`)
4. Push to the branch (`git push origin feat/my-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](./LICENSE) for details.

---

## 🔗 Related Spoolman Projects

Check out these other projects from the Spoolman ecosystem:

| Project | Description |
|---------|-------------|
| [🏠 Spoolman Home Assistant](https://github.com/Disane87/spoolman-homeassistant) | Integrate Spoolman with Home Assistant — track spools, get notifications, automate your printing workflow |
| [🎨 Spoolman Filament Swatch](https://github.com/Disane87/spoolman-filament-swatch) | Beautiful, interactive filament color browser for Spoolman. [Live Demo](https://spoolswatch.disane.dev/) |
| [📦 Spoolman Filament Extractor](https://github.com/Disane87/Spoolman-filament-extractor) | Extract your filaments from Spoolman to SpoolmanDB format |
| [🗄️ SpoolmanDB](https://github.com/Donkie/SpoolmanDB) | Centralized community filament database used by Spoolman |
| [🖨️ Spoolman](https://github.com/Donkie/Spoolman/) | The awesome filament manager that powers everything |

---

## 🙏 Credits

- [Spoolman](https://github.com/Donkie/Spoolman) by [@Donkie](https://github.com/Donkie) — the awesome filament management system that makes this possible
- [Model Context Protocol](https://modelcontextprotocol.io/) by Anthropic — the open standard powering AI tool integration
- Inspired by [spoolman-homeassistant](https://github.com/Disane87/spoolman-homeassistant) 💙

---

<p align="center">Made with ❤️ for the 3D printing community</p>
