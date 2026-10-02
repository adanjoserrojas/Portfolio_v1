import { projectBySlug } from "@/content/projects";
import { corpus } from "@/lib/retrieval";
import { retrieve } from "@/lib/rank";

export function searchPortfolio(query: string, limit: number){
    
    const information = retrieve(corpus, query);
    const totalMatches: number = information.length;
    const results = information.slice(0, limit);

    return {

        query,
        totalMatches: totalMatches,
        results: results.map(({ doc, score, matched }) => ({
            id: doc.id,
            kind: doc.kind,
            title: doc.title,
            url: new URL(doc.href, "https://www.4dan.dev").href,
            projectSlug: doc.kind === "project"
                ? doc.id.replace(/^project-/,"")
                : undefined,
            score,
            matchedFields: matched,
            excerpts: doc.fields,
        })),
    };
};

export function getPublicProject(slug: string) {
    const project = projectBySlug(slug);

    if (!project) {
        return undefined;
    }

    return {
        slug,
        name: project.name,
        summary: project.summary,
        date: project.date,
        stack: project.stack ?? [],
        github_url: project.href,
        absolute_portfolio_url: `https://www.4dan.dev/projects/${project.slug}`,
        accomplishments: (project.bullets ?? [])
        .filter((bullet) => bullet.disclosure === "cleared")
        .map((bullet) => bullet.text),
    };
};
