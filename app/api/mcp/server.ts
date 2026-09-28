import "server-only";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

import { searchPortfolio, getPublicProject } from "./portfolio";

const getProjectInputSchema = z.object({
    slug: z.string().trim().min(1).max(30),
});

export function createPortfolioServer(): McpServer {

    const server = new McpServer({ name: "portfolio", version: "1.0.0 "});
    server.registerTool(
        "search_portfolio",
        { description: "Searches information through the portfolio", inputSchema: { query: z.string().min(1).max(200) }},
        async ({ query }) => ({
            content: [{ type: "text", text: JSON.stringify(searchPortfolio(query, 5))}],
        }),
    );
    server.registerTool(
        "getPublicProject",
        { description: "gets a specific portfolio project through a slug (a short word referencing the project)", inputSchema: {slug: z.string().min(1).max(50)}},
        async ({ slug }) => ({
            content: [{ type: "text", text: JSON.stringify(getPublicProject(slug))}],
        }),
    );

    return server;
}

