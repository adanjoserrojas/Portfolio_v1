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
          your message. When a contact form is available, it collects the name,
          email address or phone number, and message you choose to provide. Please
          avoid including passwords, payment details, or other sensitive information.
        </p>
        <p>
          I use this information to read and respond to your inquiry and to manage
          the resulting conversation.
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
            When the contact form is enabled, a visitor cookie and hashed versions
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
        <h2 id="privacy-notifications">Messages and SMS notifications</h2>
        <p>
          Contact submissions may be stored in Amazon Web Services (AWS). When
          SMS delivery is enabled, your name, contact details, and message are
          processed by AWS and mobile carriers to notify me on my own phone.
          Copies may remain in service logs or on my receiving device.
        </p>
        <p>
          These SMS notifications go only to the portfolio owner. Submitting a
          contact form does not subscribe you to text messages or marketing.
        </p>
      </section>

      <section aria-labelledby="privacy-providers">
        <h2 id="privacy-providers">Service providers</h2>
        <p>
          Vercel provides website hosting. AWS supports database and messaging
          features when enabled. Email providers and mobile carriers process
          communications sent through their services. Their handling of that
          information is also governed by their own policies.
        </p>
      </section>

      <section aria-labelledby="privacy-retention">
        <h2 id="privacy-retention">Retention and deletion requests</h2>
        <p>
          No fixed automatic deletion schedule is currently set for contact
          messages or submission counters. Messages, correspondence, and abuse
          prevention records may remain until they are manually removed. Service
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
