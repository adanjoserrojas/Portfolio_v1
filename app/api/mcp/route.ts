import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createPortfolioServer } from "./server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request): Promise<Response> {
    const server = createPortfolioServer();
    const transport = new WebStandardStreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        enableJsonResponse: true,
    });

    try {
        await server.connect(transport);
        const response = await transport.handleRequest(req);
        response.headers.set("Cache-Control", "no-store");
        return response;
    } finally {
        // JSON mode finishes the tool call before handleRequest resolves.
        await server.close();
    }
}

function methodNotAllowed(): Response {
    return new Response(null, { status: 405, headers: { Allow: "POST" } });
}

export { methodNotAllowed as GET, methodNotAllowed as DELETE };
