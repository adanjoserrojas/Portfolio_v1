import type { Metadata } from "next";
import EmailLink from "@/components/site/EmailLink";
import PolicyPage from "@/components/site/PolicyPage";
import { profile } from "@/content/profile";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "How Adan Rojas's portfolio handles contact information, messages, site preferences, and notifications.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <PolicyPage
      title="Privacy policy"
      description="How information is handled when you browse this portfolio or get in touch."
      relatedHref="/terms"
      relatedLabel="Terms & conditions"
      updatedDate="2026-10-03"
      updatedLabel="October 3, 2026"
    >
      <section aria-labelledby="privacy-about">
        <h2 id="privacy-about">About this site</h2>
        <p>
          This is {profile.name}&apos;s personal software engineering portfolio.
          This policy covers information shared through this website and direct
          inquiries about the work shown here.
        </p>
      </section>

      <section aria-labelledby="privacy-information">
        <h2 id="privacy-information">Information you share</h2>
        <p>
          When you email me, I receive your email address and the information in
          your message. The contact form collects your name, email address, and
          message. You must provide a real, accurate email address that you own or
          are authorized to use and can receive replies at. Please
          avoid including passwords, payment details, or other sensitive information.
        </p>
        <p>
          I use this information to read and respond to your inquiry and to manage
          the resulting conversation.
        </p>
        <p>
          I keep your contact information private. I do not publish or sell it,
          or disclose it to others for marketing. It is processed by the service
          providers described below to operate the site and deliver your inquiry.
          Information may also be disclosed if required by law.
        </p>
      </section>

      <section aria-labelledby="privacy-preferences">
        <h2 id="privacy-preferences">Preferences and abuse prevention</h2>
        <ul>
          <li>
            Your light or dark theme preference is saved in your browser&apos;s
            local storage. You can remove it by clearing this site&apos;s browser data.
          </li>
          <li>
            A visitor cookie and hashed versions
            of the visitor identifier and IP address are used with submission
            counters to limit repeated requests. Hashing does not make these
            identifiers anonymous.
          </li>
          <li>
            Hosting and service providers may process IP addresses, request
            details, and diagnostic logs to operate and protect the site.
          </li>
        </ul>
      </section>

      <section aria-labelledby="privacy-notifications">
        <h2 id="privacy-notifications">Messages and email notifications</h2>
        <p>
          Your name, email address, and message are processed by Amazon Web
          Services (AWS) Simple Notification Service to deliver an email to my
          configured inbox. Contact messages are not saved in the site&apos;s
          DynamoDB table; that table holds abuse prevention counters and hashed
          identifiers. Copies of messages may remain in my inbox, on my devices,
          or in providers&apos; systems under their retention policies.
        </p>
        <p>
          These email notifications are intended only for the portfolio owner.
          Submitting the form does not subscribe you to text messages or marketing.
        </p>
      </section>

      <section aria-labelledby="privacy-providers">
        <h2 id="privacy-providers">Service providers</h2>
        <p>
          Vercel provides website hosting. AWS supports database and messaging
          features. When the contact security check is enabled, Cloudflare Turnstile
          processes browser and device signals to help prevent automated submissions.
          The site does not send your name, email address, or message to Turnstile.
          Email providers process
          communications sent through their services. Their handling of that
          information is also governed by their own policies.
        </p>
      </section>

      <section aria-labelledby="privacy-retention">
        <h2 id="privacy-retention">Retention and deletion requests</h2>
        <p>
          New submission counters are marked to expire seven days after their
          limit window ends. Automatic removal depends on the database expiration
          setting being enabled and may take several additional days. Older counters
          without expiration dates require separate cleanup. No fixed automatic
          deletion schedule is set for email messages and correspondence. Service
          providers may keep logs and backups under their own retention schedules.
        </p>
        <p>
          You can email me to request access to, correction of, or deletion of
          information you submitted. Include enough context to identify the
          conversation. I may need to verify that the request relates to your
          information before acting on it.
        </p>
      </section>

      <section aria-labelledby="privacy-contact">
        <h2 id="privacy-contact">Questions and updates</h2>
        <p>
          Contact {profile.name} using the email link below with questions about
          this policy or your information. Changes to this policy will be posted
          here with an updated date.
        </p>
        <div className="mt-3 inline-flex [&_a]:underline [&_a]:underline-offset-4">
          <EmailLink user={profile.email.user} domain={profile.email.domain} />
        </div>
      </section>
    </PolicyPage>
  );
}
