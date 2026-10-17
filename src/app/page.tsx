import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Keyboard, Leaf, Sprout } from "lucide-react";
import { Container } from "@/components/marketing/Container";
import { Section } from "@/components/marketing/Section";
import { PrimaryButton, SecondaryButton } from "@/components/marketing/Buttons";
import { Card } from "@/components/marketing/Card";
import { Eyebrow } from "@/components/marketing/Eyebrow";
import { HeroPlayground } from "@/components/home/HeroPlayground";
import { EcoFactCard, type HomeEcoFact } from "@/components/home/EcoFactCard";
import { ecoFacts } from "@/data/ecoFacts";

const SITE_URL = "https://mygreenkeys.com";
const TITLE = "My Green Keys: free typing and eco lessons for kids 6–14";
const DESCRIPTION =
  "Free typing lessons, typing games, Brain Sprint math and eco lessons, and daily habit quests for kids aged 6 to 14. Free for every child, parent and school. No ads.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "My Green Keys",
    images: [{ url: "/logo-bgr.png", width: 1200, height: 630, alt: "My Green Keys" }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/logo-bgr.png"],
  },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "EducationalOrganization",
      "@id": `${SITE_URL}/#organization`,
      name: "My Green Keys",
      url: SITE_URL,
      logo: `${SITE_URL}/logo-bgr.png`,
      description: DESCRIPTION,
      founder: { "@type": "Person", name: "Waleed Bin Khalid" },
      makesOffer: {
        "@type": "Offer",
        name: "My Green Keys",
        description: "Free for all: every lesson, game and dashboard is free for every child, parent and school.",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: SITE_URL,
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: "My Green Keys",
      url: SITE_URL,
      description: DESCRIPTION,
      inLanguage: "en",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};

/** Five facts from the lesson fact list (src/data/ecoFacts.ts), by id. */
const FACT_PICKS = [
  { id: 30, topic: "Water" },
  { id: 1, topic: "Trees" },
  { id: 32, topic: "Oceans" },
  { id: 105, topic: "Energy" },
  { id: 53, topic: "Bees" },
] as const;

const HOME_FACTS: HomeEcoFact[] = FACT_PICKS.flatMap(({ id, topic }) => {
  const fact = ecoFacts.find((f) => f.id === id);
  return fact ? [{ topic, text: fact.fact }] : [];
});

const KEYCAPS = [
  { ch: "G", left: "4%", size: 40, bg: "#52B788", delay: "0s" },
  { ch: "R", left: "16%", size: 36, bg: "#F2B705", delay: "4.5s" },
  { ch: "A", left: "28%", size: 44, bg: "#74C69D", delay: "2s" },
  { ch: "K", left: "41%", size: 38, bg: "#52B788", delay: "6.5s" },
  { ch: "S", left: "55%", size: 42, bg: "#F2B705", delay: "1s" },
  { ch: "N", left: "67%", size: 36, bg: "#74C69D", delay: "5.5s" },
  { ch: "J", left: "80%", size: 40, bg: "#52B788", delay: "3s" },
  { ch: "E", left: "92%", size: 38, bg: "#74C69D", delay: "8s" },
] as const;

const STEPS = [
  {
    Icon: Keyboard,
    title: "1. Type with Panda",
    text: "Short lessons start on the home row and add one or two new keys at a time, up to full sentences.",
  },
  {
    Icon: Leaf,
    title: "2. Learn an eco fact",
    text: "Each lesson comes with a short, kid-friendly fact about trees, water, animals or energy.",
  },
  {
    Icon: Sprout,
    title: "3. Watch it grow",
    text: "Earn XP and eco points, keep a daily streak going and keep your companion happy.",
  },
] as const;

const KEY_ROWS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"] as const;

const MOCK_PENDING: CSSProperties = { color: "rgba(27, 67, 50, 0.45)" };

function CheckList({ items, onDark = false }: { items: string[]; onDark?: boolean }) {
  return (
    <ul className="mgk-home-checks">
      {items.map((item) => (
        <li key={item}>
          <Check
            aria-hidden
            size={20}
            strokeWidth={2.5}
            style={{ flexShrink: 0, marginTop: 2, color: onDark ? "#74C69D" : "#2D6A4F" }}
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function HomePage() {
  return (
    <div className="mgk-home">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />

      {/* 1. HERO */}
      <section className="mgk-home-hero" aria-labelledby="home-hero-heading">
        <div className="mgk-home-keys" aria-hidden>
          {KEYCAPS.map((k) => (
            <span
              key={k.ch}
              className="mgk-home-cap mgk-home-rise"
              style={{
                left: k.left,
                width: k.size,
                height: k.size,
                background: k.bg,
                animationDelay: k.delay,
              }}
            >
              {k.ch}
            </span>
          ))}
        </div>

        <Container style={{ position: "relative", zIndex: 1 }}>
          <HeroPlayground
            intro={
              <>
                <Eyebrow variant="text" onDark>
                  Free for every child, parent and school
                </Eyebrow>
                <h1 id="home-hero-heading" className="mgk-home-h1">
                  Every key you learn grows a <span className="mgk-home-gold">greener world.</span>
                </h1>
                <p className="mgk-home-hero__sub">
                  100 typing lessons, 5 typing games, Brain Sprint and daily habit quests with Panda, made for
                  kids aged 6 to 14. Free for everyone.
                </p>
                <div className="mgk-home-hero__ctas">
                  <PrimaryButton href="/lesson" onDark>
                    Try a lesson, no sign-up
                  </PrimaryButton>
                  <SecondaryButton href="/kid-login" onDark className="mgk-btn--mint">
                    Kid login
                  </SecondaryButton>
                </div>
              </>
            }
          />
        </Container>

        <svg className="mgk-home-wave" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden focusable="false">
          <path d="M0,40 C240,84 480,4 720,30 C960,56 1200,76 1440,28 L1440,80 L0,80 Z" fill="#F2F9F4" />
        </svg>
      </section>

      {/* 2. HOW IT WORKS */}
      <Section id="how" aria-labelledby="home-how-heading">
        <Container>
          <div className="mgk-sec-head">
            <Eyebrow variant="text">How it works</Eyebrow>
            <h2 id="home-how-heading" className="mgk-h2">
              Three small steps, every day
            </h2>
            <p className="mgk-lead">Ten minutes with Panda builds a real skill and a little more care for our planet.</p>
          </div>
          <div className="mgk-grid-3">
            {STEPS.map(({ Icon, title, text }) => (
              <Card key={title} className="mgk-home-lift">
                <span className="mgk-home-icon">
                  <Icon aria-hidden size={26} strokeWidth={2} />
                </span>
                <h3 className="mgk-h3" style={{ marginTop: 16 }}>
                  {title}
                </h3>
                <p className="mgk-body" style={{ marginTop: 8 }}>
                  {text}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* 3. EVERYTHING INSIDE */}
      <Section aria-labelledby="home-inside-heading" style={{ paddingTop: 0 }}>
        <Container>
          <div className="mgk-sec-head">
            <Eyebrow variant="text">Everything inside, all free</Eyebrow>
            <h2 id="home-inside-heading" className="mgk-h2">
              More than a typing tutor
            </h2>
          </div>
          <div className="mgk-home-grid-6">
            <article className="mgk-home-feature mgk-home-feature--dark mgk-home-lift">
              <p className="mgk-home-big" aria-hidden>
                100
              </p>
              <h3 className="mgk-home-feature__title">100 typing lessons</h3>
              <p className="mgk-home-feature__text">
                Six stages, from the home row to numbers, capitals and speed drills. Every lesson shows the next
                key and the finger to use.
              </p>
            </article>

            <article className="mgk-home-feature mgk-home-lift">
              <h3 className="mgk-home-feature__title">Brain Sprint</h3>
              <p className="mgk-home-feature__text">
                15 quick-fire lessons: 10 math sprints from adding to dividing, and 5 eco lessons on recycling,
                animals, forests, climate and daily eco actions.
              </p>
            </article>

            <article className="mgk-home-feature mgk-home-lift">
              <h3 className="mgk-home-feature__title">Typing games</h3>
              <p className="mgk-home-feature__text">
                Falling Leaves, Sort Recycling, Save the Ocean, Eco Garden and Kind World Academy. New games unlock
                as kids finish more lessons.
              </p>
            </article>

            <article className="mgk-home-feature mgk-home-lift">
              <h3 className="mgk-home-feature__title">Daily habits</h3>
              <p className="mgk-home-feature__text">
                Parents set habit quests that run for 7 to 30 days. Kids keep a daily streak and can share photos
                of real eco actions for a parent to approve.
              </p>
            </article>

            <article className="mgk-home-feature mgk-home-lift">
              <h3 className="mgk-home-feature__title">Eco rewards</h3>
              <p className="mgk-home-feature__text">
                Earn XP and eco points, rise through five ranger ranks from Cadet to Planet Hero, and unlock
                certificates at 10, 25, 50 and 100 lessons.
              </p>
            </article>

            <article className="mgk-home-feature mgk-home-feature--brand mgk-home-lift">
              <h3 className="mgk-home-feature__title">Your eco companion</h3>
              <p className="mgk-home-feature__text">
                Kids choose a panda or a turtle and give it a name. Typing every day keeps it happy; skip a few
                days and it starts to miss you.
              </p>
            </article>
          </div>
        </Container>
      </Section>

      {/* 4. LESSON PREVIEW */}
      <Section aria-labelledby="home-preview-heading" style={{ paddingTop: 0 }}>
        <Container>
          <div className="mgk-home-preview">
            <div>
              <h2 id="home-preview-heading" className="mgk-h2" style={{ color: "#fff" }}>
                The next key always glows
              </h2>
              <p className="mgk-home-preview__text">
                Kids see the word to type, the next key to press and which finger to use, so good habits start
                from the very first lesson.
              </p>
              <ul className="mgk-home-pills" aria-label="Highlights">
                <li>Works in any browser</li>
                <li>Ages 6 to 14</li>
                <li>No ads</li>
              </ul>
            </div>

            <div className="mgk-home-mock">
              <p className="mgk-home-mock__label">Type this:</p>
              <p className="mgk-home-mock__word">
                <span className="sr-only">seaside sand. Typed so far: sea. Next letter: s.</span>
                <span aria-hidden>
                  <span className="mgk-home-mock__typed">sea</span>
                  <span className="mgk-home-caret" />
                  <span className="mgk-home-mock__next">s</span>
                  <span style={MOCK_PENDING}>ide sand</span>
                </span>
              </p>
              <div
                className="mgk-home-kbd"
                role="group"
                aria-label="Keyboard preview: the S key glows yellow and the home row is tinted"
                tabIndex={0}
              >
                <div className="mgk-home-kbd__inner" aria-hidden>
                  {KEY_ROWS.map((row, r) => (
                    <div key={row} className="mgk-home-kbd__row" style={{ paddingLeft: r * 14 }}>
                      {row.split("").map((k) => (
                        <span
                          key={k}
                          className={[
                            "mgk-home-key",
                            r === 1 && "mgk-home-key--home",
                            k === "S" && "mgk-home-key--glow",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        >
                          {k}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              <div className="mgk-home-mock__tip">
                <Image src="/images/home/panda-happy.webp" alt="" width={40} height={41} sizes="40px" />
                <p>
                  <strong>Panda says:</strong> use your left ring finger for S.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* 5. DID YOU KNOW */}
      <Section aria-labelledby="home-facts-heading" style={{ paddingTop: 0 }}>
        <Container>
          <div className="mgk-home-split">
            <div>
              <Eyebrow variant="text">Did you know?</Eyebrow>
              <h2 id="home-facts-heading" className="mgk-h2" style={{ marginTop: 16 }}>
                Small facts, big feelings for the planet
              </h2>
              <p className="mgk-lead" style={{ marginTop: 16 }}>
                Lessons come with short facts about our planet, written for kids. Here are five of them.
              </p>
            </div>
            <EcoFactCard facts={HOME_FACTS} />
          </div>
        </Container>
      </Section>

      {/* 6. PARENTS AND SCHOOLS */}
      <Section id="schools" aria-labelledby="home-schools-heading" style={{ background: "#DFF1E6" }}>
        <Container>
          <div className="mgk-sec-head">
            <h2 id="home-schools-heading" className="mgk-h2">
              For families at home and classrooms everywhere
            </h2>
            <p className="mgk-lead">No plans, no trials, no card. Every feature is free.</p>
          </div>
          <div className="mgk-home-duo">
            <div className="mgk-home-audience">
              <h3 className="mgk-h3">For parents</h3>
              <CheckList
                items={[
                  "A profile for each of your children",
                  "See lessons, typing speed and streaks at a glance",
                  "Kids log in with a simple code, no email needed",
                ]}
              />
              <PrimaryButton href="/signup" style={{ marginTop: "auto" }}>
                Create a free parent account
              </PrimaryButton>
            </div>

            <div className="mgk-home-audience mgk-home-audience--dark">
              <h3 className="mgk-h3" style={{ color: "#fff" }}>
                For schools
              </h3>
              <p className="mgk-home-audience__intro">Become a sustainability partner</p>
              <CheckList
                onDark
                items={[
                  "Assign lessons to a whole class or to one student",
                  "Class leaderboards for friendly competition",
                  "Kiosk mode: students tap their name on a shared computer and type their own code",
                ]}
              />
              <PrimaryButton href="/schools" onDark style={{ marginTop: "auto" }}>
                Partner with us
              </PrimaryButton>
            </div>
          </div>
        </Container>
      </Section>

      {/* 7. OUR STORY */}
      <Section aria-labelledby="home-story-heading">
        <Container narrow>
          <h2 id="home-story-heading" className="sr-only">
            Our story
          </h2>
          <figure className="mgk-home-story">
            <span className="mgk-home-story__avatar">
              <Image src="/images/home/panda-happy.webp" alt="" width={80} height={82} sizes="80px" />
            </span>
            <blockquote className="mgk-home-story__quote">
              &ldquo;I kept worrying about the planet our children will grow up on. I believe kids are the ones who
              will make the future better, so I built a place where they learn a real skill and learn to care for
              the earth at the same time.&rdquo;
            </blockquote>
            <figcaption className="mgk-home-story__by">
              <span>Waleed Bin Khalid, Founder</span>
              <Link href="/story" className="mgk-home-link">
                Read our story
              </Link>
            </figcaption>
          </figure>
        </Container>
      </Section>

      {/* 8. FINAL CTA */}
      <Section aria-labelledby="home-cta-heading" style={{ paddingTop: 0 }}>
        <Container>
          <div className="mgk-home-cta">
            <span className="mgk-home-cap mgk-home-bob" aria-hidden style={{ top: 28, left: "7%", background: "#F2B705" }}>
              G
            </span>
            <span
              className="mgk-home-cap mgk-home-bob"
              aria-hidden
              style={{ bottom: 32, right: "8%", background: "#74C69D", animationDelay: "1.5s" }}
            >
              K
            </span>
            <h2 id="home-cta-heading" className="mgk-h2" style={{ color: "#fff" }}>
              Let&apos;s save planet earth, one key at a time.
            </h2>
            <p className="mgk-home-cta__sub">Start a lesson right now. No sign-up, no cost, just you and Panda.</p>
            <div className="mgk-btn-row" style={{ marginTop: 32 }}>
              <PrimaryButton href="/lesson" onDark>
                Try a lesson
              </PrimaryButton>
              <SecondaryButton href="/signup" onDark>
                Create a free account
              </SecondaryButton>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
