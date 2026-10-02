import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createPortfolioServer } from "./server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handle( req: Request): Promise<Response> {

    const server = createPortfolioServer();
    const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    await server.connect(transport);

    return transport.handleRequest(req);
    
}

export { handle as GET, handle as POST, handle as DELETE };