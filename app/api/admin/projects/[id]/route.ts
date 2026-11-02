import { session, validOrigin } from "@/lib/project-dashboard/auth";
import { revalidateTag, revalidatePath } from "next/cache";
import { z } from "zod";

const deletion = z
  .object({
    version: z.number().int().positive(),
    idempotencyKey: z.string().regex(/^[a-zA-Z0-9-]{16,80}$/),
  })
  .strict();

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!validOrigin(request))
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const current = await session();
  if (!current)
    return Response.json({ error: "Sign in required" }, { status: 401 });
  const { id } = await params;
  const input = deletion.safeParse(await request.json().catch(() => null));
  if (!/^[a-zA-Z0-9-]{1,80}$/.test(id) || !input.success)
    return Response.json(
      { error: "Invalid deletion request" },
      { status: 422 },
    );
  try {
    const res = await fetch(
      `${process.env.BOARD_API}/v1/admin/projects/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${current.accessToken}`,
          "Content-Type": "application/json",
          "Idempotency-Key": input.data.idempotencyKey,
        },
        body: JSON.stringify({ version: input.data.version }),
        cache: "no-store",
      },
    );
    const result = await res.json();
    if (res.ok) {
      try {
        revalidateTag("buildlog-board");
        revalidatePath("/board");
      } catch {
        result.warning =
          "Deleted. Public view will refresh within five minutes.";
      }
    }
    return Response.json(result, {
      status: res.status,
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch {
    return Response.json(
      { error: "Unable to delete. Please try again." },
      { status: 503 },
    );
  }
}
