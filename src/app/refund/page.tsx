import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy | My Green Keys",
  description: "Refund Policy for My Green Keys subscriptions.",
};

const UPDATED = "May 13, 2026";
const CONTACT_EMAIL = "mygreenkeys26@gmail.com";

function Container({ children }: { children: React.ReactNode }) {
  return <div className="mgk-container max-w-[900px]">{children}</div>;
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-10 text-xl font-extrabold text-[var(--navy)]">{children}</h2>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 text-[15px] leading-7 text-slate-700">{children}</p>;
}

export default function RefundPage() {
  return (
    <div className="bg-[var(--bg-alt)]">
      <div className="bg-[var(--navy)]">
        <Container>
          <div className="mgk-section-tight">
            <p className="text-[12px] font-extrabold tracking-[0.18em] text-[var(--yellow)]">
              LEGAL
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-[-0.02em] text-white md:text-4xl">
              Refund Policy
            </h1>
            <p className="mt-4 max-w-[75ch] text-sm leading-7 text-white/75">
              This policy explains when you can request a refund for a paid My Green Keys
              subscription, how to contact us, and what to expect after you cancel.
            </p>
            <p className="mt-2 text-xs text-white/55">Last updated: {UPDATED}</p>
          </div>
        </Container>
      </div>

      <Container>
        <div className="mgk-section-tight">
          <div className="mgk-card p-6 md:p-8">
            <H2>Eligibility</H2>
            <P>
              If you are not satisfied with a <strong>paid subscription</strong>, you may request a
              <strong> full refund within 14 days</strong> of the date you were charged. This applies
              to the subscription payment itself, subject to verification of your purchase.
            </P>

            <H2>Process</H2>
            <P>
              Email{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="font-semibold text-[var(--green)] underline underline-offset-4"
              >
                {CONTACT_EMAIL}
              </a>{" "}
              with your order details (for example, the email address used at checkout, approximate
              date of purchase, and plan name). We aim to respond within{" "}
              <strong>3 business days</strong>.
            </P>

            <H2>Promo codes</H2>
            <P>
              Promotional access—such as codes like <strong>GoGreen</strong> that unlock a free
              trial—is provided at no charge. <strong>Free trials are not refundable</strong> because
              no payment was collected for that promotional access.
            </P>

            <H2>Subscription cancellation</H2>
            <P>
              You can <strong>cancel your subscription at any time</strong> from your account
              settings. When you cancel, you keep access to paid features until the end of your
              current billing period; we do not refund unused time after that period has started unless
              you qualify under the eligibility section above.
            </P>

            <H2>Refund timeline</H2>
            <P>
              After we approve a refund, it is typically processed within{" "}
              <strong>7–10 business days</strong> back to your <strong>original payment method</strong>
              . Timing can vary slightly depending on your bank or card issuer.
            </P>

            <H2>Contact</H2>
            <P>
              For refund questions or subscription help, write to{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="font-semibold text-[var(--green)] underline underline-offset-4"
              >
                {CONTACT_EMAIL}
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
