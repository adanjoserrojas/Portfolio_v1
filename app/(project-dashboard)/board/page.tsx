import { readBoard } from "@/lib/project-dashboard/board";
import BoardView from "@/components/project-dashboard/BoardView";
export const revalidate = 300;
export default async function Page() {
  try {
    const board = await readBoard();
    return (
      <BoardView
        initial={board.projects}
        revision={board.revision}
        updatedAt={board.updatedAt}
      />
    );
  } catch {
    return (
      <main id="main" className="unavailable">
        <span className="brand">
          b<span>↗</span>
        </span>
        <h1>A brief intermission.</h1>
        <p>The board is temporarily unavailable. Please try again shortly.</p>
        <a className="primary" href="/board">
          Try again
        </a>
      </main>
    );
  }
}
