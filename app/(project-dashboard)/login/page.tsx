import Link from "next/link";
import { LockKeyhole, ArrowUpRight, ArrowLeft } from "lucide-react";
export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main id="main" className="login-page">
      <Link href="/board" className="back">
        <ArrowLeft size={16} /> Back to the board
      </Link>
      <section className="login-card">
        <div className="brand">
          b<span>↗</span>
        </div>
        <p className="eyebrow">THE WORKSPACE</p>
        <h1>
          Good things
          <br />
          are in progress.
        </h1>
        <p>
          Sign in to manage projects, share updates,
          <br />
          and keep the work moving.
        </p>
        {error && (
          <p role="alert" className="error">
            Sign-in could not be completed. Please try again.
          </p>
        )}
        <a className="primary" href="/auth/login">
          <LockKeyhole size={16} /> Sign in with Cognito{" "}
          <ArrowUpRight size={16} />
        </a>
        <small>Private workspace · Owner access only</small>
      </section>
      <footer>
        BUILDLOG <span>A little more behind the scenes.</span>
      </footer>
    </main>
  );
}
