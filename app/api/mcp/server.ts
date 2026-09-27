import "server-only";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

import { searchPortfolio, getPublicProject } from "./portfolio";

const getProjectInputSchema = z.object({
    slug: z.string().trim().min(1).max(30),
});

export function createPortfolioServer(): McpServer {

    const server: any = ""
    return server;
}

