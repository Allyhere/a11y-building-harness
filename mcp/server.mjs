#!/usr/bin/env node
import { createRequire } from "node:module";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { getBlueprints } from "../harness/blueprints.mjs";

const { name, version } = createRequire(import.meta.url)("../package.json");

const server = new McpServer({
  name,
  version,
});

server.registerTool(
  "get_blueprints",
  {
    title: "Get compact a11y cards",
    description:
      "Return compact implementation cards for widgets. Prefer native HTML or a kit primitive; these cards are last-resort APG reminders.",
    inputSchema: {
      patterns: z
        .array(z.string())
        .min(1)
        .describe("Widget names, e.g. button, modal, dialog"),
    },
  },
  async ({ patterns }) => ({
    content: [
      {
        type: "text",
        text: JSON.stringify(getBlueprints(patterns), null, 2),
      },
    ],
  }),
);

const transport = new StdioServerTransport();
await server.connect(transport);
