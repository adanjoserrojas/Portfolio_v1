import { projectBySlug } from "@/content/projects";
import { corpus } from "@/lib/retrieval";
import { retrieve } from "@/lib/rank";
import type { BusyBlock } from "@/lib/calendar/schema";
import { addDays, clock, zonedMidnight } from "@/lib/calendar/time";

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

/**
 * The gaps between busy blocks on one local day, earliest first.
 *
 * Bounded by local midnight to midnight, so a block that spans midnight only
 * counts for the part inside `day`. Starts no earlier than now: a free hour
 * that already passed would mislead someone asking "when is he free today?".
 * Sorted defensively — Google already merges overlaps, but this is cheap.
 */
export function freeSlots(day: string, busy: BusyBlock[], timeZone: string): BusyBlock[] {
    const dayStart = zonedMidnight(day, timeZone).getTime();
    const dayEnd = zonedMidnight(addDays(day, 1), timeZone).getTime();
    const iso = (ms: number) => new Date(ms).toISOString();

    const free: BusyBlock[] = [];
    let cursor = Math.max(dayStart, Date.now());

    const sorted = [...busy].sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
    for (const block of sorted) {
        const start = Math.max(Date.parse(block.start), dayStart);
        const end = Math.min(Date.parse(block.end), dayEnd);
        if (start > cursor) free.push({ start: iso(cursor), end: iso(start) });
        cursor = Math.max(cursor, end);
    }
    if (cursor < dayEnd) free.push({ start: iso(cursor), end: iso(dayEnd) });

    return free;
}

/** `9:00 AM – 10:30 AM` in Adan's zone, so the client never converts from UTC itself. */
export function labelled(blocks: BusyBlock[], timeZone: string) {
    return blocks.map(({ start, end }) => ({
        start,
        end,
        label: `${clock(start, timeZone)} – ${clock(end, timeZone)}`,
    }));
}
