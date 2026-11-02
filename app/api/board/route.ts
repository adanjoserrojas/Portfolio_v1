import { readBoard } from "@/lib/project-dashboard/board";
export async function GET() {
  try {
    return Response.json(await readBoard(), {
      headers: { "Cache-Control": "public, max-age=0, must-revalidate" },
    });
  } catch {
    return Response.json(
      { error: "The board is temporarily unavailable." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
