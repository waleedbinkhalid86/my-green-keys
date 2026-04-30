import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | My Green Keys",
  description: "Privacy Policy for My Green Keys (COPPA + GDPR).",
};

const UPDATED = "April 30, 2026";
const CONTACT_EMAIL = "waleedbinkhalid86@gmail.com";

function Container({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-[900px] px-6">{children}</div>;
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-10 text-xl font-extrabold text-[var(--navy)]">{children}</h2>;
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="mt-6 text-base font-extrabold text-[var(--navy)]">{children}</h3>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 text-[15px] leading-7 text-slate-700">{children}</p>;
}

function Li({ children }: { children: React.ReactNode }) {
  return <li className="text-[15px] leading-7 text-slate-700">{children}</li>;
}

export default function PrivacyPage() {
  return (
    <div className="bg-[var(--bg-alt)]">
      <div className="bg-[var(--navy)]">
        <Container>
          <div className="py-14">
            <p className="text-[12px] font-extrabold tracking-[0.18em] text-[var(--yellow)]">
              PRIVACY
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-[-0.02em] text-white md:text-4xl">
              Privacy Policy
            </h1>
            <p className="mt-4 max-w-[75ch] text-sm leading-7 text-white/75">
              This Privacy Policy explains how My Green Keys collects and uses information. It
              includes specific protections for children under 13 (COPPA) and rights for European
              users (GDPR).
            </p>
            <p className="mt-2 text-xs text-white/55">Last updated: {UPDATED}</p>
          </div>
        </Container>
      </div>

      <Container>
        <div className="py-12">
          <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm md:p-8">
            <H2>1) Who we are</H2>
            <P>
              <strong>Company name:</strong> My Green Keys
              <br />
              <strong>Contact:</strong>{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="font-semibold text-[var(--green)] underline underline-offset-4"
              >
                {CONTACT_EMAIL}
              </a>
            </P>

            <H2>2) Summary of key points (plain language)</H2>
            <ul className="mt-3 list-disc pl-6 space-y-2">
              <Li>
                <strong>Kids’ privacy first:</strong> For children under 13, we require parental
                consent where COPPA requires it and we limit collection to what’s needed for learning.
              </Li>
              <Li>
                <strong>GDPR rights:</strong> European users can request access, correction, deletion,
                portability, restriction, objection, and can withdraw consent where applicable.
              </Li>
              <Li>
                <strong>Core providers:</strong> We use Supabase for data storage/authentication and
                Vercel for hosting. Future payments may use Stripe or Paddle.
              </Li>
              <Li>
                <strong>Account deletion:</strong> Parents/guardians can request deletion of a child’s
                information at any time.
              </Li>
            </ul>

            <H2>3) Information we collect</H2>
            <H3>A. Information you provide</H3>
            <ul className="mt-3 list-disc pl-6 space-y-2">
              <Li>
                <strong>Parent/guardian account info:</strong> email address and login credentials.
              </Li>
              <Li>
                <strong>Child profile info:</strong> a display name (or nickname) and learning settings.
              </Li>
              <Li>
                <strong>Learning content:</strong> typing progress such as lessons completed, speed
                (WPM), and accuracy.
              </Li>
              <Li>
                <strong>Uploads (if enabled):</strong> photos or other content submitted for features
                like eco-action rewards (these may contain personal information depending on the photo).
              </Li>
              <Li>
                <strong>Support communications:</strong> information you include in emails to us.
              </Li>
            </ul>

            <H3>B. Information collected automatically</H3>
            <ul className="mt-3 list-disc pl-6 space-y-2">
              <Li>
                <strong>Device & log data:</strong> IP address, browser type, timestamps, pages viewed,
                and diagnostic events used for security and reliability.
              </Li>
              <Li>
                <strong>Cookies / similar technologies:</strong> used for essential functions such as
                authentication, session management, and security. Where non-essential cookies are used
                (for example, analytics), we will provide appropriate controls.
              </Li>
            </ul>

            <H2>4) How we use information</H2>
            <ul className="mt-3 list-disc pl-6 space-y-2">
              <Li>Provide the learning experience and features you request.</Li>
              <Li>Authenticate users, keep accounts secure, and prevent fraud/abuse.</Li>
              <Li>Maintain, debug, and improve the service.</Li>
              <Li>Respond to support requests and parental/GDPR requests.</Li>
              <Li>
                If paid plans are enabled, process payments and manage subscriptions through Stripe or
                Paddle (future).
              </Li>
            </ul>

            <H2>5) COPPA: Children under 13</H2>
            <P>
              My Green Keys is designed for kids, and we take children’s privacy seriously. For users
              under 13:
            </P>
            <ul className="mt-3 list-disc pl-6 space-y-2">
              <Li>
                <strong>Parental consent:</strong> We require verifiable parental consent where COPPA
                requires it before collecting personal information from a child.
              </Li>
              <Li>
                <strong>Parental rights:</strong> Parents/guardians can review their child’s personal
                information, request deletion, and refuse further collection or use.
              </Li>
              <Li>
                <strong>Limited collection:</strong> We aim to collect only what’s reasonably necessary
                for the educational purpose.
              </Li>
              <Li>
                <strong>No targeted advertising to kids:</strong> We do not knowingly serve interest-based
                advertising to children under 13.
              </Li>
            </ul>
            <P>
              To make a COPPA request, email{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="font-semibold text-[var(--green)] underline underline-offset-4"
              >
                {CONTACT_EMAIL}
              </a>
              .
            </P>

            <H2>6) GDPR: European users</H2>
            <H3>Lawful bases</H3>
            <P>
              When GDPR applies, we process personal data under one or more lawful bases, such as:
              performance of a contract (providing the service), legitimate interests (security,
              fraud prevention, improving reliability), and consent (where required for certain cookies
              or optional features).
            </P>
            <H3>Your rights</H3>
            <ul className="mt-3 list-disc pl-6 space-y-2">
              <Li>Access, correction, deletion, and portability of your personal data.</Li>
              <Li>Restriction or objection to certain processing.</Li>
              <Li>Withdraw consent at any time where processing is based on consent.</Li>
              <Li>Lodge a complaint with your local supervisory authority.</Li>
            </ul>
            <P>
              To exercise rights, contact{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="font-semibold text-[var(--green)] underline underline-offset-4"
              >
                {CONTACT_EMAIL}
              </a>
              . We may need to verify your identity and authority (especially for parent/child accounts).
            </P>

            <H2>7) Sharing and third-party services</H2>
            <P>
              We share information only as needed to operate My Green Keys, comply with law, or protect
              users. Key service providers include:
            </P>
            <ul className="mt-3 list-disc pl-6 space-y-2">
              <Li>
                <strong>Supabase (data storage/authentication):</strong> stores account data and learning
                progress in our database.
              </Li>
              <Li>
                <strong>Vercel (hosting):</strong> hosts our website and server infrastructure.
              </Li>
              <Li>
                <strong>Stripe / Paddle (future payments):</strong> if enabled, processes payments and
                may collect payment identifiers and billing-related metadata.
              </Li>
            </ul>

            <H2>8) Cookies</H2>
            <P>
              We use cookies and similar technologies for essential functionality (like login sessions)
              and security. If we add optional cookies (such as analytics), we will provide appropriate
              notices and choices consistent with applicable law.
            </P>

            <H2>9) Data retention</H2>
            <P>
              We keep personal data only as long as necessary to provide the service and for legitimate
              business or legal purposes. Parents/guardians can request deletion of child accounts at
              any time.
            </P>

            <H2>10) Account deletion and parental deletion requests</H2>
            <P>
              You can request deletion by emailing{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="font-semibold text-[var(--green)] underline underline-offset-4"
              >
                {CONTACT_EMAIL}
              </a>
              . When account deletion tools are available in-app, you may also delete from your account
              settings. We may verify parental authority to protect children.
            </P>

            <H2>11) International transfers</H2>
            <P>
              Our providers (such as Supabase and Vercel) may process and store data in the United
              States and other countries. Where GDPR applies, we rely on appropriate safeguards for
              cross-border transfers (such as standard contractual clauses or equivalent mechanisms)
              as provided by the relevant service providers.
            </P>

            <H2>12) Security</H2>
            <P>
              We use reasonable administrative, technical, and physical safeguards designed to protect
              personal information. No method of transmission or storage is 100% secure, so we cannot
              guarantee absolute security.
            </P>

            <H2>13) Changes to this Policy</H2>
            <P>
              We may update this Privacy Policy from time to time. If we make material changes, we will
              take reasonable steps to notify you (for example, by posting an update on this page).
            </P>

            <H2>14) Related pages</H2>
            <P>
              See also our{" "}
              <Link href="/terms" className="font-semibold text-[var(--green)] underline underline-offset-4">
                Terms of Service
              </Link>
              .
            </P>

            <P>
              <span className="text-slate-500">
                Note: This document is provided for general informational purposes and is not legal
                advice.
              </span>
            </P>
          </div>
        </div>
      </Container>
    </div>
  );
}

