import type { Metadata } from "next";
import EmailLink from "@/components/site/EmailLink";
import PolicyPage from "@/components/site/PolicyPage";
import { profile } from "@/content/profile";

export const metadata: Metadata = {
  title: "Terms & conditions",
  description:
    "Terms for using Adan Rojas's portfolio, submitting inquiries, and receiving owner notifications.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <PolicyPage
      title="Terms & conditions"
      description="A few guidelines for using this portfolio and getting in touch."
      relatedHref="/privacy"
      relatedLabel="Privacy policy"
    >
      <section aria-labelledby="terms-purpose">
        <h2 id="terms-purpose">Purpose of the site</h2>
        <p>
          {profile.name} operates this personal portfolio to share software
          engineering projects, experience, and ways to get in touch. These terms
          apply to your use of the site and its contact features.
        </p>
      </section>

      <section aria-labelledby="terms-contact">
        <h2 id="terms-contact">Getting in touch</h2>
        <p>
          Use the contact options for relevant questions, professional
          opportunities, or project discussions. You must provide accurate contact
          information, including a real email address that you own or are authorized
          to use and can receive replies at. Do not use fabricated contact details.
          Share only information you have permission to submit.
        </p>
        <p>
          Sending an inquiry does not create a service agreement or guarantee a
          response. Any work or commitments must be agreed separately.
        </p>
      </section>

      <section aria-labelledby="terms-use">
        <h2 id="terms-use">Acceptable use</h2>
        <ul>
          <li>Do not send spam, threats, unlawful content, or impersonate someone else.</li>
          <li>Do not submit malicious code or attempt unauthorized access to the site.</li>
          <li>Do not flood the contact form or attempt to bypass submission limits.</li>
        </ul>
        <p>
          Requests may be limited or blocked to protect the site and its visitors.
        </p>
      </section>

      <section aria-labelledby="terms-delivery">
        <h2 id="terms-delivery">Submission limits and delivery</h2>
        <p>
          When available, the contact form limits submission attempts by visitor
          and network. Failed attempts may count toward those limits. A request
          may be rejected when a limit is reached or a service is unavailable.
        </p>
        <p>
          A submission confirmation means the application accepted the request;
          it does not guarantee that a notification has reached me or that I have
          read it. If you need another way to reach me, use the email link below.
        </p>
      </section>

      <section aria-labelledby="terms-notifications">
        <h2 id="terms-notifications">Email notifications and contact privacy</h2>
        <p>
          Contact submissions are sent through AWS to my configured email inbox.
          Visitors cannot choose a notification recipient and are not subscribed
          to marketing or text messages by submitting the form.
        </p>
        <p>
          Your contact information is kept private and is not published, sold,
          or disclosed to others for marketing. Hosting, messaging, and email
          providers process it to operate the site and deliver your inquiry, as
          described in the privacy policy. Information may also be disclosed if
          required by law.
        </p>
      </section>

      <section aria-labelledby="terms-links">
        <h2 id="terms-links">Linked sites and project materials</h2>
        <p>
          Links to code repositories, professional profiles, and other websites
          lead to services with their own terms and privacy practices. Project
          code and other materials remain subject to their applicable licenses
          and permissions.
        </p>
      </section>

      <section aria-labelledby="terms-updates">
        <h2 id="terms-updates">Changes and questions</h2>
        <p>
          The site and its features may change or become unavailable. Updates to
          these terms will appear here with a revised date. For questions about
          the site or these terms, contact {profile.name} by email.
        </p>
        <div className="mt-3 inline-flex [&_a]:underline [&_a]:underline-offset-4">
          <EmailLink user={profile.email.user} domain={profile.email.domain} />
        </div>
      </section>
    </PolicyPage>
  );
}
