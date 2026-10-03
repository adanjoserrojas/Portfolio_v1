"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import ContactChallenge from "@/components/site/ContactChallenge";
import { ContactSchema } from "@/lib/contactSchema";

type Field = "name" | "contact" | "message";

export default function Form() {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "submitted">("idle");
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [submitError, setSubmitError] = useState("");
  const [website, setWebsite] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [challengeReset, setChallengeReset] = useState(0);
  const [retryAt, setRetryAt] = useState(0);
  const [retrySeconds, setRetrySeconds] = useState(0);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!retryAt) return;
    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((retryAt - Date.now()) / 1000));
      setRetrySeconds(remaining);
      if (!remaining) { setRetryAt(0); setSubmitError(""); }
    }, 1000);
    return () => clearInterval(timer);
  }, [retryAt]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "loading" || retrySeconds > 0) return;
    setSubmitError("");

    const result = ContactSchema.safeParse({ name, contact, message });
    if (!result.success) {
      const fieldErrors: Partial<Record<Field, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as Field;
        fieldErrors[field] ??= issue.message;
      }
      setErrors(fieldErrors);
      const firstInvalid = event.currentTarget.elements.namedItem(result.error.issues[0].path[0] as string);
      if (firstInvalid instanceof HTMLElement) firstInvalid.focus();
      return;
    }

    setErrors({});
    if (siteKey && !turnstileToken) {
      setSubmitError("Please complete the security check before sending your message.");
      return;
    }
    setStatus("loading");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...result.data, website, turnstileToken }),
      });
      if (response.status === 429) {
        const header = Number(response.headers.get("Retry-After") ?? 60);
        const seconds = Number.isFinite(header) ? Math.min(86400, Math.max(1, header)) : 60;
        setRetryAt(Date.now() + seconds * 1000);
        setRetrySeconds(seconds);
        setStatus("idle");
        setSubmitError("Too many messages. Your entries are still here; please try again when the wait ends.");
        return;
      }
      if (response.status === 403) {
        setStatus("idle");
        setSubmitError("The request could not be verified. Complete a new security check and try again. Your entries are still here.");
        return;
      }
      if (!response.ok) throw new Error("Contact submission failed");
      setStatus("submitted");
    } catch {
      setStatus("idle");
      setSubmitError("Could not send your message. Please try again later. Your entries are still here.");
    } finally {
      // Verification tokens are single-use, including attempts that fail later.
      setTurnstileToken("");
      setChallengeReset((value) => value + 1);
    }
  }

  if (status === "submitted") {
    return (
      <div role="status" className="flex flex-col items-center justify-center gap-4 p-4 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-ink">
          <Check aria-hidden="true" className="h-10 w-10 text-surface" />
        </div>
        <p className="text-ink">Your message has been submitted. Thank you for getting in touch!</p>
      </div>
    );
  }

  const inputClass = "w-full rounded-md border border-line bg-surface p-4 text-ink placeholder:text-muted";

  return (
    <form noValidate onSubmit={handleSubmit} className="grid gap-6" aria-busy={status === "loading"}>
      <div hidden aria-hidden="true">
        <label htmlFor="contact-website">Leave this field empty</label>
        <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off"
          value={website} onChange={(event) => setWebsite(event.target.value)} />
      </div>
      <div>
        <label htmlFor="contact-name" className="mb-2 block text-sm text-ink">Name</label>
        <input id="contact-name" name="name" type="text" autoComplete="name" required maxLength={100}
          value={name} disabled={status === "loading"}
          onChange={(event) => { setName(event.target.value); setErrors((current) => ({ ...current, name: undefined })); }}
          placeholder="Your name" className={inputClass}
          aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "name-error" : undefined} />
        {errors.name && <p id="name-error" className="mt-2 text-sm text-ink">{errors.name}</p>}
      </div>
      <div>
        <label htmlFor="contact-email" className="mb-2 block text-sm text-ink">Email address</label>
        <input id="contact-email" name="contact" type="email" autoComplete="email" required maxLength={254}
          value={contact} disabled={status === "loading"}
          onChange={(event) => { setContact(event.target.value); setErrors((current) => ({ ...current, contact: undefined })); }}
          onBlur={() => {
            if (!contact) return;
            const result = ContactSchema.shape.contact.safeParse(contact);
            setErrors((current) => ({ ...current, contact: result.success ? undefined : result.error.issues[0].message }));
          }}
          placeholder="name@example.com" className={inputClass}
          aria-invalid={Boolean(errors.contact)} aria-describedby={`email-help${errors.contact ? " email-error" : ""}`} />
        <p id="email-help" className="mt-2 text-sm text-muted">Use a real email address you can receive replies at.</p>
        {errors.contact && <p id="email-error" className="mt-2 text-sm text-ink">{errors.contact}</p>}
      </div>
      <div>
        <label htmlFor="contact-message" className="mb-2 block text-sm text-ink">Message</label>
        <textarea id="contact-message" name="message" required maxLength={1600} rows={5}
          value={message} disabled={status === "loading"}
          onChange={(event) => { setMessage(event.target.value); setErrors((current) => ({ ...current, message: undefined })); }}
          placeholder="What would you like to share?" className={`${inputClass} resize-y`}
          aria-invalid={Boolean(errors.message)} aria-describedby={`message-count${errors.message ? " message-error" : ""}`} />
        <p id="message-count" className="mt-2 text-right text-xs text-muted">{message.length}/1600 characters</p>
        {errors.message && <p id="message-error" className="mt-2 text-sm text-ink">{errors.message}</p>}
      </div>
      <p className="text-sm leading-relaxed text-muted">
        Your details are used to handle your inquiry and are not published or shared for marketing.
        Read the <Link href="/privacy" className="underline underline-offset-4 hover:text-ink">privacy policy</Link> and{" "}
        <Link href="/terms" className="underline underline-offset-4 hover:text-ink">terms & conditions</Link>.
      </p>
      {siteKey && <ContactChallenge siteKey={siteKey} resetKey={challengeReset} onToken={setTurnstileToken} />}
      {submitError && <p role="alert" className="text-sm text-ink">{submitError}</p>}
      <button type="submit" disabled={status === "loading" || retrySeconds > 0}
        className="rounded-md bg-raised p-4 text-ink transition-colors hover:cursor-pointer hover:bg-match disabled:cursor-wait disabled:opacity-60">
        {status === "loading" ? "Sending..." : retrySeconds > 0
          ? `Try again in ${retrySeconds > 60 ? `${Math.ceil(retrySeconds / 60)} min` : `${retrySeconds} sec`}`
          : "Send message"}
      </button>
      <span role="status" className="sr-only">{status === "loading" ? "Sending your message." : ""}</span>
    </form>
  );
}
