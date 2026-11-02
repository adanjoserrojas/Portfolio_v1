import { z } from "zod";
export const statuses = [
  "not_started",
  "in_progress",
  "in_review",
  "finished",
] as const;
export const labels = {
  not_started: "Not Started",
  in_progress: "In Progress",
  in_review: "In Review",
  finished: "Finished",
};
const safeLink = z.union([
  z.literal(""),
  z
    .string()
    .url()
    .refine((v) => new URL(v).protocol === "https:", "Use an HTTPS link"),
]);
export const projectInput = z
  .object({
    title: z.string().trim().min(1).max(100),
    description: z.string().trim().max(1500),
    status: z.enum(statuses),
    tags: z.array(z.string().trim().min(1).max(30)).max(6),
    demoUrl: safeLink,
    repoUrl: safeLink,
    visible: z.boolean(),
    archived: z.boolean(),
    privateNotes: z.string().max(3000),
    position: z.number().int().min(0).max(9999),
  })
  .strict();
export type Project = z.infer<typeof projectInput> & {
  id: string;
  version: number;
  updatedAt: string;
};
export type PublicProject = Omit<
  Project,
  "privateNotes" | "visible" | "archived"
>;
export type Board = {
  revision: number;
  updatedAt: string;
  projects: PublicProject[];
};
export function publicProject(p: Project): PublicProject {
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    status: p.status,
    tags: p.tags,
    demoUrl: p.demoUrl,
    repoUrl: p.repoUrl,
    position: p.position,
    version: p.version,
    updatedAt: p.updatedAt,
  };
}
export const publicBoardSchema = z.object({
  revision: z.number(),
  updatedAt: z.string(),
  projects: z.array(
    projectInput
      .omit({ privateNotes: true, visible: true, archived: true })
      .extend({ id: z.string(), version: z.number(), updatedAt: z.string() })
      .strip(),
  ),
});
