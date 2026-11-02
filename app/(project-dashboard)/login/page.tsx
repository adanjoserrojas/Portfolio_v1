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
        <p className="eyebrow">Adan&apos;s mega-cool workspace</p>
        <h1>
          Idk what you are doing here...
          <br />
          This is for me to sign in lol
        </h1>
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
    </main>
  );
}
