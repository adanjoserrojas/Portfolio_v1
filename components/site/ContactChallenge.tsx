"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: {
        sitekey: string;
        action: string;
        size: "compact" | "flexible";
        theme: "auto";
        callback: (token: string) => void;
        "expired-callback": () => void;
        "error-callback": () => void;
      }) => string;
      remove: (id: string) => void;
    };
  }
}

export default function ContactChallenge({ siteKey, resetKey, onToken }: {
  siteKey: string;
  resetKey: number;
  onToken: (token: string) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    if (!container.current) return;
    const observer = new ResizeObserver(([entry]) => setCompact(entry.contentRect.width < 300));
    observer.observe(container.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const api = window.turnstile;
    if (!ready || !api || !container.current) return;
    onToken("");
    const id = api.render(container.current, {
      sitekey: siteKey,
      action: "contact",
      size: compact ? "compact" : "flexible",
      theme: "auto",
      callback: (token) => { setFailed(false); onToken(token); },
      "expired-callback": () => onToken(""),
      "error-callback": () => { onToken(""); setFailed(true); },
    });
    return () => { api.remove(id); };
  }, [ready, siteKey, resetKey, attempt, compact, onToken]);

  return (
    <div className="min-w-0">
      <p className="mb-2 text-sm text-ink">Security check</p>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => setReady(true)}
        onError={() => { onToken(""); setFailed(true); }}
      />
      <div ref={container} />
      {failed && (
        <p role="alert" className="mt-2 text-sm text-ink">
          The security check could not finish. Check your connection or browser blocker.
          {ready && <button type="button" className="ml-1 underline underline-offset-4"
            onClick={() => { setFailed(false); setAttempt((value) => value + 1); }}>Retry security check</button>}
        </p>
      )}
    </div>
  );
}
