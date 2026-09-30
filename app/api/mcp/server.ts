import "server-only";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

import { searchPortfolio, getPublicProject } from "./portfolio";

const getProjectInputSchema = z.object({
    slug: z.string().trim().min(1).max(30),
});
const searchPortfolioInputSchema = z.object({
    query: z.string().trim().min(1).max(200),
    limit: z.number().int().min(1).max(5).default(3),
});

export function createPortfolioServer(): McpServer {

    const server = new McpServer({ name: "portfolio", version: "1.0.0" });
    server.registerTool(
        "search_portfolio",
        {
            description: "Search Adan's public projects, experience, skills, and education. Returns ranked excerpts and source URLs; use a returned projectSlug with get_project for details.",
            inputSchema: searchPortfolioInputSchema,
            annotations: { readOnlyHint: true },
        },
        async ({ query, limit }): Promise<CallToolResult> => {
            const data = searchPortfolio(query, limit);
            return {
                content: [{ type: "text", text: JSON.stringify(data) }],
                structuredContent: data,
            };
        },
    );
    server.registerTool(
        "get_project",
        {
            description: "Get a public project's summary, stack, accomplishments, and links by slug. Use the projectSlug returned by search_portfolio, such as ipalo.",
            inputSchema: getProjectInputSchema,
            annotations: { readOnlyHint: true },
        },
        async ({ slug }): Promise<CallToolResult> => {
            const data = getPublicProject(slug);
            if (!data) {
                return {
                    isError: true,
                    content: [{ type: "text", text: `Project "${slug}" was not found. Use search_portfolio to find a projectSlug.` }],
                };
            }
            return {
                content: [{ type: "text", text: JSON.stringify(data) }],
                structuredContent: data,
            };
        },
    );

    return server;
}

