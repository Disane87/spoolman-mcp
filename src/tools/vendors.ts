import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { SpoolmanClient } from "../client.js";

export function registerVendorTools(server: McpServer, client: SpoolmanClient): void {
  // ── GET /vendor ──────────────────────────────
  server.tool(
    "spoolman_list_vendors",
    "List and search vendors in Spoolman. Supports filtering by name and pagination.",
    {
      name: z.string().optional().describe("Filter vendors by name (partial match)"),
      sort: z.string().optional().describe("Sort expression, e.g. 'name:asc'"),
      limit: z.number().int().positive().optional().describe("Maximum number of results"),
      offset: z.number().int().min(0).optional().describe("Pagination offset"),
    },
    async ({ name, sort, limit, offset }) => {
      const vendors = await client.getVendors({ name, sort, limit, offset });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(vendors, null, 2),
          },
        ],
      };
    }
  );

  // ── GET /vendor/{id} ─────────────────────────
  server.tool(
    "spoolman_get_vendor",
    "Get a single vendor by its ID.",
    {
      id: z.number().int().positive().describe("The vendor ID"),
    },
    async ({ id }) => {
      const vendor = await client.getVendor(id);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(vendor, null, 2),
          },
        ],
      };
    }
  );

  // ── POST /vendor ─────────────────────────────
  server.tool(
    "spoolman_create_vendor",
    "Create a new vendor in Spoolman.",
    {
      name: z.string().min(1).describe("Vendor name (required)"),
      comment: z.string().optional().describe("Optional comment"),
    },
    async ({ name, comment }) => {
      const vendor = await client.createVendor({ name, comment });
      return {
        content: [
          {
            type: "text",
            text: `Vendor created successfully:\n${JSON.stringify(vendor, null, 2)}`,
          },
        ],
      };
    }
  );

  // ── PATCH /vendor/{id} ───────────────────────
  server.tool(
    "spoolman_update_vendor",
    "Update an existing vendor by ID. Only provide the fields you want to change.",
    {
      id: z.number().int().positive().describe("The vendor ID"),
      name: z.string().optional().describe("New name"),
      comment: z.string().optional().describe("New comment"),
    },
    async ({ id, name, comment }) => {
      const vendor = await client.updateVendor(id, { name, comment });
      return {
        content: [
          {
            type: "text",
            text: `Vendor updated successfully:\n${JSON.stringify(vendor, null, 2)}`,
          },
        ],
      };
    }
  );

  // ── DELETE /vendor/{id} ──────────────────────
  server.tool(
    "spoolman_delete_vendor",
    "Delete a vendor by ID. This will cascade to associated filaments.",
    {
      id: z.number().int().positive().describe("The vendor ID"),
    },
    async ({ id }) => {
      await client.deleteVendor(id);
      return {
        content: [
          {
            type: "text",
            text: `Vendor with ID ${id} deleted successfully.`,
          },
        ],
      };
    }
  );
}
