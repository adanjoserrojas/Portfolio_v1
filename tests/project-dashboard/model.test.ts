import { test } from "node:test";
import assert from "node:assert/strict";
import {
  projectInput,
  publicProject,
  publicBoardSchema,
  type Project,
} from "../../lib/project-dashboard/model";
const project: Project = {
  id: "one",
  title: "A project",
  description: "Testing",
  status: "not_started",
  tags: ["Rails"],
  demoUrl: "",
  repoUrl: "",
  privateNotes: "SECRET",
  visible: true,
  archived: false,
  position: 0,
  version: 1,
  updatedAt: "2026-11-02T00:00:00Z",
};
test("public projection cannot leak private fields", () => {
  const value = publicProject(project);
  assert.equal("privateNotes" in value, false);
  assert.equal("visible" in value, false);
  assert.equal(JSON.stringify(value).includes("SECRET"), false);
});
test("unsafe links, unknown statuses, blank titles and oversized tags are rejected", () => {
  const input = projectInput.strip().parse(project);
  for (const patch of [
    { title: "  " },
    { status: "deleted" },
    { demoUrl: "javascript:alert(1)" },
    { tags: ["x".repeat(31)] },
    { privateNotes: "x".repeat(3001) },
  ])
    assert.equal(projectInput.safeParse({ ...input, ...patch }).success, false);
  assert.equal(projectInput.safeParse(input).success, true);
});
test("public parser strips private fields from a malformed source record", () => {
  const value = publicBoardSchema.parse({
    revision: 1,
    updatedAt: "now",
    projects: [project],
  });
  assert.equal("privateNotes" in value.projects[0], false);
});
