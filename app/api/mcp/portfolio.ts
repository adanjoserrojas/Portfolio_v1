import { projectBySlug } from "@/content/projects";4
import { corpus } from "@/lib/retrieval";
import { retrieve } from "@/lib/rank";

{/*
    return shape for the search portfolio function
    {
        query: string;
        totalMatches: number;
        results: Array<{
            id: string;
            kind: string;
            title: string;
            url: string;
            projectSlug?: string;
            score: number;
            matchedFields: string[];
            excerpts: string[];
        }>;
    }

    return shape for the getPublicProject function:
    {
        slug: string;
        name: string;
        summary: string;
        date: string;
        url: string;
        stack?: string[];
        repositoryUrl?: string;
        accomplishments: string[];
    }

    (parameter) p: {
 slug: string;
 name: string;
 summary: string;
 date: string;
 conflicts: {
 field: string;
 value: string;
 alternative: string;
 question: string;
 openQuestion: string;
 }[];
 _source: "repo" | "resume" | "both" | "github" | "owner";
 _sourceRef: string;
 stack?: string[] | undefined;
 bullets?: {
 text: string;
 disclosure: "cleared" | "hold";
 holdReason?: string | undefined;
 }[] | undefined;
 href?: string | undefined;
}
*/}

export function searchPortfolio(query: string, limit: number){
    
    const information = retrieve(corpus, query);
    const totalMatches: number = information.length;
    const results = information.slice(0, limit);

    return {

        query: query,
        totalMatches: totalMatches,
        results: Array<{
            id: string;
            kind: string;
            title: string;
            url: string;
            projectSlug?: string;
            score: number;
            matchedFields: string[];
            excerpts: string[];
        }>
    }
};

export function getPublicProject(slug: string) {
    const project = projectBySlug(slug);

    if (!project) {
        return undefined;
    }

    return {
        slug: project.slug,
        name: project.name,
        summary: project.summary,
        date: project.date,
        stack: project.stack ?? [],
        github_url: project.href,
        absolute_portfolio_url: `https://4dan.dev/projects/${project.slug}`,
        accomplishments: (project.bullets ?? [])
        .filter((bullet) => bullet.disclosure === "cleared")
        .map((bullet) => bullet.text),
    }
};
