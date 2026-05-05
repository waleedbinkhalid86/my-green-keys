import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | My Green Keys",
  description: "Terms of Service for My Green Keys.",
};

const UPDATED = "April 30, 2026";

function Container({ children }: { children: React.ReactNode }) {
  return <div className="mgk-container max-w-[900px]">{children}</div>;
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-10 text-xl font-extrabold text-[var(--navy)]">{children}</h2>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 text-[15px] leading-7 text-slate-700">{children}</p>;
}

function Li({ children }: { children: React.ReactNode }) {
  return <li className="text-[15px] leading-7 text-slate-700">{children}</li>;
}

export default function TermsPage() {
  return (
    <div className="bg-[var(--bg-alt)]">
      <div className="bg-[var(--navy)]">
        <Container>
          <div className="mgk-section-tight">
            <p className="text-[12px] font-extrabold tracking-[0.18em] text-[var(--yellow)]">
              LEGAL
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-[-0.02em] text-white md:text-4xl">
              Terms of Service
            </h1>
            <p className="mt-4 max-w-[70ch] text-sm leading-7 text-white/75">
              Welcome to My Green Keys. These Terms govern your use of our website and services.
            </p>
            <p className="mt-2 text-xs text-white/55">Last updated: {UPDATED}</p>
          </div>
        </Container>
      </div>

      <Container>
        <div className="mgk-section-tight">
          <div className="mgk-card p-6 md:p-8">
            <P>
              By accessing or using My Green Keys, you agree to these Terms. If you do not agree,
              please do not use the service.
            </P>

            <H2>1) Who can use My Green Keys</H2>
            <P>
              My Green Keys is designed for children ages 6–14 and the parents/guardians, teachers,
              and schools that support them.
            </P>
            <ul className="mt-3 list-disc pl-6 space-y-2">
              <Li>
                <strong>Children under 13 (COPPA):</strong> A parent or legal guardian must provide
                verifiable parental consent before we create an account for a child under 13 where
                we collect personal information beyond what is permitted without consent.
              </Li>
              <Li>
                <strong>Parents/Guardians:</strong> You are responsible for supervising your
                child’s use and for the accuracy of information you provide.
              </Li>
              <Li>
                <strong>EU/EEA/UK users (GDPR):</strong> If you use My Green Keys in Europe, you
                may have additional rights described in our{" "}
                <Link href="/privacy" className="font-semibold text-[var(--green)] underline underline-offset-4">
                  Privacy Policy
                </Link>
                .
              </Li>
            </ul>

            <H2>2) Accounts and parental consent</H2>
            <P>
              When an account is created for a child under 13, we require parental consent and we
              may ask a parent/guardian to confirm identity or authority in a reasonable way. Parents
              can review, delete, or restrict further collection or use of their child’s information.
            </P>

            <H2>3) Acceptable use</H2>
            <P>You agree not to:</P>
            <ul className="mt-3 list-disc pl-6 space-y-2">
              <Li>Use the service for unlawful, harmful, or abusive purposes.</Li>
              <Li>Attempt to access accounts or data you do not own or have permission to use.</Li>
              <Li>Reverse engineer, interfere with, or disrupt the service or security controls.</Li>
              <Li>Upload content that infringes rights or is inappropriate for children.</Li>
            </ul>

            <H2>4) Content and educational materials</H2>
            <P>
              My Green Keys provides typing lessons and educational content. You may use the service
              for personal, family, classroom, or school use as applicable to your plan. You may not
              copy, resell, or redistribute our content except as allowed by law or by written
              permission.
            </P>

            <H2>5) Subscriptions, billing, and future payments</H2>
            <P>
              Some features may require a paid subscription. Payments may be processed by third-party
              payment providers such as <strong>Stripe</strong> or <strong>Paddle</strong> in the future.
              When enabled, additional payment terms may apply at checkout and will be incorporated
              into these Terms.
            </P>

            <H2>6) Data, cookies, and third-party services</H2>
            <P>
              We use third-party services to operate My Green Keys, including <strong>Supabase</strong>{" "}
              (data storage/authentication) and <strong>Vercel</strong> (hosting). We may use cookies
              and similar technologies to keep you signed in, protect the service, and remember
              preferences. See our{" "}
              <Link href="/privacy" className="font-semibold text-[var(--green)] underline underline-offset-4">
                Privacy Policy
              </Link>{" "}
              for details.
            </P>

            <H2>7) Account deletion</H2>
            <P>
              Parents/guardians can request deletion of their account and their child’s account(s)
              at any time. You may be able to delete accounts from within the app (when available) or
              by contacting us at{" "}
              <a
                href="mailto:waleedbinkhalid86@gmail.com"
                className="font-semibold text-[var(--green)] underline underline-offset-4"
              >
                waleedbinkhalid86@gmail.com
              </a>
              . We will verify the requester’s authority where appropriate to protect children.
            </P>

            <H2>8) Privacy and GDPR</H2>
            <P>
              Our Privacy Policy explains what data we collect, how we use it, and your rights,
              including GDPR rights for European users and COPPA parental controls for children under
              13.
            </P>

            <H2>9) Disclaimers</H2>
            <P>
              The service is provided on an “as is” and “as available” basis. We work hard to keep
              My Green Keys reliable and secure, but we do not guarantee uninterrupted operation or
              that the service will be error-free.
            </P>

            <H2>10) Limitation of liability</H2>
            <P>
              To the maximum extent permitted by law, My Green Keys will not be liable for indirect,
              incidental, special, consequential, or punitive damages, or for any loss of profits or
              revenues, arising out of or related to your use of the service.
            </P>

            <H2>11) Changes to these Terms</H2>
            <P>
              We may update these Terms from time to time. If we make material changes, we will take
              reasonable steps to notify you (for example, by posting an update on this page).
            </P>

            <H2>12) Contact</H2>
            <P>
              If you have questions about these Terms, COPPA, or GDPR requests, contact us at{" "}
              <a
                href="mailto:waleedbinkhalid86@gmail.com"
                className="font-semibold text-[var(--green)] underline underline-offset-4"
              >
                waleedbinkhalid86@gmail.com
              </a>
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

