import { redirect } from "next/navigation";
import { session } from "@/lib/project-dashboard/auth";
import BoardView from "@/components/project-dashboard/BoardView";
export const dynamic = "force-dynamic";
export default async function Admin() {
  const current = await session();
  if (!current) redirect("/login");
  const response = await fetch(`${process.env.BOARD_API}/v1/admin/projects`, {
    headers: { Authorization: `Bearer ${current.accessToken}` },
    cache: "no-store",
  });
  if (!response.ok)
    return (
      <main id="main" className="unavailable">
        <h1>We couldn’t load the workspace.</h1>
        <p>Your projects are safe. Please retry or sign in again.</p>
        <a href="/admin">Retry</a> · <a href="/auth/login">Sign in again</a>
      </main>
    );
  const board = await response.json();
  return <BoardView initial={board.projects} revision={board.revision} admin />;
}
