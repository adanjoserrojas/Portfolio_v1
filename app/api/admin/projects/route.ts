import { session, validOrigin } from "@/lib/project-dashboard/auth";
import { revalidateTag, revalidatePath } from "next/cache";
import { projectInput } from "@/lib/project-dashboard/model";
export async function GET() {
  const current = await session();
  if (!current)
    return Response.json({ error: "Sign in required" }, { status: 401 });
  const res = await fetch(`${process.env.BOARD_API}/v1/admin/projects`, {
    headers: { Authorization: `Bearer ${current.accessToken}` },
    cache: "no-store",
  });
  return new Response(await res.text(), {
    status: res.status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "private, no-store",
    },
  });
}
export async function POST(request: Request) {
  return mutate(request, "POST");
}
export async function PATCH(request: Request) {
  return mutate(request, "PATCH");
}
async function mutate(request: Request, method: string) {
  if (!validOrigin(request))
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const current = await session();
  if (!current)
    return Response.json({ error: "Sign in required" }, { status: 401 });
  try {
    const raw = await request.json();
    const { id, version, idempotencyKey, ...fields } = raw;
    const input = projectInput.safeParse(fields);
    if (!input.success)
      return Response.json(
        { error: input.error.issues[0].message },
        { status: 422 },
      );
    if (
      method === "PATCH" &&
      (!/^[a-zA-Z0-9-]{1,80}$/.test(id) || !Number.isInteger(version))
    )
      return Response.json(
        { error: "Invalid project version" },
        { status: 422 },
      );
    if (
      typeof idempotencyKey !== "string" ||
      !/^[a-zA-Z0-9-]{16,80}$/.test(idempotencyKey)
    )
      return Response.json(
        { error: "Missing request identifier" },
        { status: 422 },
      );
    const res = await fetch(
      `${process.env.BOARD_API}/v1/admin/projects${method === "PATCH" ? `/${id}` : ""}`,
      {
        method,
        headers: {
          Authorization: `Bearer ${current.accessToken}`,
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({
          ...input.data,
          ...(method === "PATCH" ? { version } : {}),
        }),
        cache: "no-store",
      },
    );
    const result = await res.json();
    if (res.ok) {
      try {
        revalidateTag("buildlog-board");
        revalidatePath("/board");
      } catch {
        result.warning = "Saved. Public view will refresh within five minutes.";
      }
    }
    return Response.json(result, {
      status: res.status,
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch {
    return Response.json(
      { error: "Unable to save. Please try again." },
      { status: 503 },
    );
  }
}
