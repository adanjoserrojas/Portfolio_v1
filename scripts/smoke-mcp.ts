/** Exercise an SDK client against the route in memory, or a supplied live URL. */
import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { CallToolResultSchema, type CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { POST, GET, DELETE } from "../app/api/mcp/route";
import { experience } from "../content/experience";
import { projects } from "../content/projects";

const searchResultSchema = z.object({
    query: z.string(),
    totalMatches: z.number(),
    results: z.array(z.object({
        url: z.url(),
        projectSlug: z.string().optional(),
    })),
});

function structured(result: CallToolResult) {
    assert.ok(!result.isError, JSON.stringify(result.content));
    assert.ok(result.structuredContent);
    const text = result.content[0];
    assert.equal(text.type, "text");
    assert.deepEqual(JSON.parse(text.text), result.structuredContent);
    return result.structuredContent;
}

async function main() {
    const liveUrl = process.argv[2];
    const endpoint = new URL(liveUrl ?? "http://localhost:3000/api/mcp");
    const request: typeof fetch = liveUrl ? fetch : async (input, init) => {
        const req = new Request(input, init);
        if (req.method === "POST") return POST(req);
        if (req.method === "GET") return GET();
        if (req.method === "DELETE") return DELETE();
        throw new Error(`Unexpected HTTP method: ${req.method}`);
    };
    const client = new Client({ name: "portfolio-smoke-test", version: "1.0.0" });
    const transport = new StreamableHTTPClientTransport(endpoint, { fetch: request });
    const call = async (name: string, args: Record<string, unknown>) =>
        CallToolResultSchema.parse(await client.callTool({ name, arguments: args }));

    try {
        await client.connect(transport);
        const { tools } = await client.listTools();
        assert.deepEqual(tools.map(tool => tool.name).sort(), ["get_project", "search_portfolio"]);
        assert.ok(tools.every(tool => tool.annotations?.readOnlyHint === true));

        const limited = searchResultSchema.parse(structured(await call("search_portfolio", { query: "  Python  ", limit: 1 })));
        assert.equal(limited.query, "Python");
        assert.equal(limited.results.length, 1);
        assert.ok(limited.totalMatches > 1);

        const defaults = searchResultSchema.parse(structured(await call("search_portfolio", { query: "Python" })));
        assert.equal(defaults.results.length, Math.min(3, defaults.totalMatches));
        assert.equal(defaults.totalMatches, limited.totalMatches);
        const maximum = searchResultSchema.parse(structured(await call("search_portfolio", { query: "Python", limit: 5 })));
        assert.equal(maximum.results.length, Math.min(5, maximum.totalMatches));
        const empty = searchResultSchema.parse(structured(await call("search_portfolio", { query: "zzzzzznonexistent" })));
        assert.equal(empty.totalMatches, 0);
        assert.deepEqual(empty.results, []);

        for (const args of [
            { query: "" }, { query: "   " }, { query: 42 }, { query: "x".repeat(201) },
            { query: "Python", limit: 0 }, { query: "Python", limit: 6 },
            { query: "Python", limit: 1.5 }, { query: "Python", limit: "3" },
        ]) {
            assert.equal((await call("search_portfolio", args)).isError, true, JSON.stringify(args));
        }
        for (const slug of ["", "   ", 42, "x".repeat(31)]) {
            assert.equal((await call("get_project", { slug })).isError, true);
        }
        const missing = await call("get_project", { slug: "unknown" });
        assert.equal(missing.isError, true);
        assert.match(JSON.stringify(missing.content), /not found/);
        assert.equal(structured(await call("get_project", { slug: " ipalo " })).slug, "ipalo");

        const found = searchResultSchema.parse(structured(await call("search_portfolio", { query: "iPalo", limit: 5 })));
        const projectHit = found.results.find(hit => hit.projectSlug === "ipalo");
        assert.ok(projectHit);
        const detail = structured(await call("get_project", { slug: projectHit.projectSlug }));
        assert.equal(detail.absolute_portfolio_url, projectHit.url);

        for (const project of projects) {
            const data = structured(await call("get_project", { slug: project.slug }));
            assert.deepEqual(data.accomplishments, (project.bullets ?? [])
                .filter(bullet => bullet.disclosure === "cleared").map(bullet => bullet.text));
            for (const key of ["_source", "_sourceRef", "conflicts", "bullets"]) {
                assert.ok(!(key in data));
            }
        }
        const heldBullets = [...experience, ...projects].flatMap(item =>
            (item.bullets ?? []).filter(bullet => bullet.disclosure === "hold"));
        for (const bullet of heldBullets) {
            const result = await call("search_portfolio", { query: bullet.text.slice(0, 200), limit: 5 });
            assert.ok(!JSON.stringify(structured(result)).includes(bullet.text));
        }

        for (const method of ["GET", "DELETE"]) {
            const response = await request(endpoint, { method });
            assert.equal(response.status, 405);
            assert.equal(response.headers.get("allow"), "POST");
        }
        const response = await request(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream" },
            body: JSON.stringify({ jsonrpc: "2.0", id: 99, method: "tools/list" }),
        });
        assert.equal(response.status, 200);
        assert.match(response.headers.get("content-type") ?? "", /application\/json/);
        assert.equal(response.headers.get("cache-control"), "no-store");
        await response.json();
        console.log(`MCP checks passed (${liveUrl ? "live HTTP" : "in-process HTTP"}): discovery, schemas, limits, defaults, errors, public content, repeated calls, and transport.`);
    } finally {
        await client.close();
    }
}

main().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
});
