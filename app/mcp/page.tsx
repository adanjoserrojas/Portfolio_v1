import type { Metadata } from "next";
import { Page, PageTitle } from "@/components/site/Prose";

export const metadata: Metadata = {
  title: "MCP",
  description:
    "Connect your AI assistant to Adan Rojas's portfolio to search public work and retrieve project details.",
  alternates: { canonical: "/mcp" },
};


export default function MCP(){
    return (
        <Page>
            <PageTitle
                eyebrow="Index"
                title="MCP"
                lede="Connect your AI assistant to search my work and explore individual projects."
            />
            <section aria-labelledby="connect-heading" className="mb-10">
                <h2 id="connect-heading" className="mb-4 font-mono text-xs uppercase tracking-[0.08em] text-muted">
                    Connect
                </h2>
                <ol className="list-decimal space-y-3 pl-5">
                    <li>In an AI app that supports remote MCP, add a custom connector or MCP server.</li>
                    <li>Name it <strong>Adan&apos;s portfolio</strong> and enter this server URL:
                        <code className="mt-2 block break-all rounded-(--radius) border border-line bg-raised p-3 font-mono text-sm">
                            https://www.4dan.dev/api/mcp
                        </code>
                    </li>
                    <li>If asked for a transport, select <strong>Streamable HTTP</strong>. No account or API key is required.</li>
                    <li>Enable the connector in your conversation, then ask about my work.</li>
                </ol>
            </section>
            <section aria-labelledby="tools-heading" className="mb-10">
                <h2 id="tools-heading" className="mb-4 font-mono text-xs uppercase tracking-[0.08em] text-muted">
                    Available tools
                </h2>
                <dl>
                    <div className="border-b border-line py-3">
                        <dt className="font-mono text-sm">search_portfolio</dt>
                        <dd className="mt-2">Search public projects, experience, skills, and education. Returns 3 matches by default; you can request between 1 and 5.</dd>
                    </div>
                    <div className="border-b border-line py-3">
                        <dt className="font-mono text-sm">get_project</dt>
                        <dd className="mt-2">Get a project&apos;s summary, technologies, accomplishments, and links using a slug such as <code className="font-mono text-sm">ipalo</code>.</dd>
                    </div>
                </dl>
                <p className="mt-4 text-muted">Both tools read public portfolio content. They do not modify data.</p>
            </section>
            <section aria-labelledby="examples-heading" className="mb-10">
                <h2 id="examples-heading" className="mb-4 font-mono text-xs uppercase tracking-[0.08em] text-muted">
                    Try asking
                </h2>
                <ul className="list-disc space-y-3 pl-5">
                    <li>Find two of Adan&apos;s projects that use Python and link to the sources.</li>
                    <li>Tell me about iPalo and the technologies behind it.</li>
                </ul>
            </section>
        </Page>
    );
}
