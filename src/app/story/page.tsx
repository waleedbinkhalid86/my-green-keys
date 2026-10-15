import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Container } from "@/components/marketing/Container";
import { Section } from "@/components/marketing/Section";
import { PrimaryButton, SecondaryButton } from "@/components/marketing/Buttons";
import { Card } from "@/components/marketing/Card";

export const metadata: Metadata = {
  title: {
    absolute: "Our story: why I built My Green Keys",
  },
  description:
    "Why a founder with sixteen years in logistics built a free typing and eco-learning platform for children.",
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
          <h1 className="mgk-h1">Why I built My Green Keys</h1>
          <p className="mgk-lead" style={{ marginTop: 16 }}>
            A note from the founder.
          </p>
        </Container>
      </Section>

      <Section style={{ paddingTop: 0 }}>
        <Container narrow>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--mgk-space-4)" }}>
            {/* Section 1: The worry */}
            <Card bodyStyle={cardBody}>
              <h2 className="mgk-h2">A worry I couldn&apos;t ignore</h2>
              <p className="mgk-body" style={prose}>
                Every year, the news about our planet gets harder to read. Hotter summers,
                changing seasons, a future that feels uncertain. I wanted to do something
                about it, not just worry. But what can one person do about climate change?
              </p>
            </Card>

            {/* Section 2: What I had to offer */}
            <Card bodyStyle={cardBody}>
              <h2 className="mgk-h2">What I had to offer</h2>
              <p className="mgk-body" style={prose}>
                I have spent nearly sixteen years in logistics, working with customers every
                day: solving problems, building trust and helping people get comfortable with
                technology. Along the way I learned to build software too. Those are the
                skills I know best, so I asked myself a simple question: how can I use them
                to give something back to the earth?
              </p>
              <p className="mgk-body" style={prose}>
                The answer was in front of me. The children growing up today are the ones
                who will make tomorrow better. If we want a greener future, it has to start
                with them.
              </p>
            </Card>

            {/* Section 3: Skill and learning */}
            <Card bodyStyle={cardBody}>
              <h2 className="mgk-h2">Skill and learning, together</h2>
              <p className="mgk-body" style={prose}>
                My Green Keys is built on one idea: a child can build a skill and care for
                the planet at the same time. Typing is a skill every child needs. So we
                wrapped it in eco lessons, games and daily habits, and made it free for every
                child.
              </p>
            </Card>

            {/* Section 4: Play your part */}
            <Card bodyStyle={cardBody}>
              <h2 className="mgk-h2">Play your part with us</h2>
              <p className="mgk-body" style={prose}>
                This is only the beginning. If you run a school, partner with us and bring it
                to your students. If you are a parent, try it with your child. And join us in
                taking on environmental challenges together, because every small action
                counts.
              </p>
            </Card>

            {/* Closing */}
            <Card bodyStyle={{ ...cardBody, textAlign: "center" }}>
              <p className="mgk-lead" style={{ lineHeight: 1.75 }}>
                Let&apos;s save planet earth, one key at a time.
              </p>
              <p className="mgk-label" style={{ marginTop: 24, fontSize: "1.0625rem", color: "#1B4332" }}>
                Waleed Bin Khalid, Founder, My Green Keys
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
