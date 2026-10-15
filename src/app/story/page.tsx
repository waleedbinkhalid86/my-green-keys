import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Container } from "@/components/marketing/Container";
import { Section } from "@/components/marketing/Section";
import { PrimaryButton, SecondaryButton } from "@/components/marketing/Buttons";
import { Card } from "@/components/marketing/Card";

export const metadata: Metadata = {
  title: {
    absolute: "Our Story — Why I Built My Green Keys",
  },
  description:
    "Why Waleed Bin Khalid built My Green Keys: 15 years at DHL Express, a daily habit instead of another app, and learning that builds character.",
};

const pageBg: CSSProperties = {
  backgroundColor: "#FAFAF5",
  backgroundImage: "radial-gradient(circle, #D1D5DB 1px, transparent 1px)",
  backgroundSize: "20px 20px",
  minHeight: "100%",
};

/** Long-form reading: slightly looser line height than the default body. */
const prose: CSSProperties = { lineHeight: 1.75, marginTop: 16 };

const cardBody: CSSProperties = { padding: "var(--mgk-space-4)" };

export default function StoryPage() {
  return (
    <div style={pageBg}>
      {/* Hero */}
      <Section style={{ paddingBottom: "var(--mgk-space-5)" }}>
        <Container narrow style={{ textAlign: "center" }}>
          <h1 className="mgk-h1">Why I Built My Green Keys</h1>
          <p className="mgk-lead" style={{ marginTop: 16 }}>
            A note from the founder.
          </p>
        </Container>
      </Section>

      <Section style={{ paddingTop: 0 }}>
        <Container narrow>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--mgk-space-4)" }}>
            {/* Section 1: DHL */}
            <Card bodyStyle={cardBody}>
              <h2 className="mgk-h2">15 years watching the world go digital</h2>
              <p className="mgk-body" style={prose}>
                I spent 15 years at DHL Express, watching entire industries move online —
                logistics, paperwork, communication, all of it. Every year the world got
                faster and more digital. And every year, I noticed the same gap back home:
                Pakistani kids weren&apos;t being prepared for it. Schools focused on exams,
                not the basic digital skills kids would need for everything else in their
                lives. Typing, one of the most fundamental skills for using a computer at
                all, was barely taught anywhere.
              </p>
            </Card>

            {/* Section 2: The insight */}
            <Card bodyStyle={cardBody}>
              <h2 className="mgk-h2">Kids don&apos;t need another app. They need a daily habit.</h2>
              <p className="mgk-body" style={prose}>
                I didn&apos;t want to build another app that gets downloaded once and
                forgotten. I wanted to build a habit. That&apos;s where typing came in — it
                is, by nature, a skill that only improves with daily practice. You
                can&apos;t cram it the night before an exam. So typing became the vehicle:
                a few minutes a day, every day, building a skill kids will use for the rest
                of their lives — while also opening the door to daily math practice and
                good habits along the way.
              </p>
            </Card>

            {/* Section 3: Why green */}
            <Card bodyStyle={cardBody}>
              <h2 className="mgk-h2">Why &quot;green&quot;</h2>
              <p className="mgk-body" style={prose}>
                Learning should build character, not just skills. That&apos;s why My Green
                Keys pairs typing practice with eco lessons — and why real progress in the
                app leads to real trees being planted. Screen time isn&apos;t something to
                feel guilty about when it&apos;s building a habit, teaching a skill, and
                doing something good for the planet at the same time.
              </p>
            </Card>

            {/* Closing */}
            <Card bodyStyle={{ ...cardBody, textAlign: "center" }}>
              <p className="mgk-lead" style={{ lineHeight: 1.75 }}>
                That&apos;s why I built My Green Keys — for every kid learning to type, and
                for the planet they&apos;ll inherit.
              </p>
              <p className="mgk-label" style={{ marginTop: 24, fontSize: "1.0625rem", color: "#1B4332" }}>
                Waleed Bin Khalid, Founder
              </p>
              <div className="mgk-btn-row" style={{ marginTop: 32 }}>
                <PrimaryButton href="/schools">For schools</PrimaryButton>
                <SecondaryButton href="/signup">Get started</SecondaryButton>
              </div>
            </Card>
          </div>
        </Container>
      </Section>
    </div>
  );
}
