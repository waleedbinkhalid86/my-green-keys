"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const PAGE_BG = "#F0F9F4";
const dottedBg: React.CSSProperties = {
  backgroundColor: PAGE_BG,
  backgroundImage: "radial-gradient(circle, #D1D5DB 1px, transparent 1px)",
  backgroundSize: "20px 20px",
};

/** Public asset: repo has welcome-banner.jpg (see public/images/hub/). */
const WELCOME_BANNER_SRC = "/images/hub/welcome-banner.jpg";

// TODO: Point to /quest when the dedicated kid habit quest page exists (no /quest route yet).
const HABIT_QUEST_HREF = "/lesson";

type HubCard = {
  title: string;
  subtitle: string;
  href: string;
  imageSrc: string;
};

const HUB_CARDS: HubCard[] = [
  {
    title: "Typing Lessons",
    subtitle: "Build your typing skills",
    href: "/lesson",
    imageSrc: "/images/hub/typing.png",
  },
  {
    title: "Brain Sprint",
    subtitle: "Math + eco mini lessons",
    href: "/brain-sprint",
    imageSrc: "/images/hub/brain-sprint.png",
  },
  {
    title: "Games",
    subtitle: "Play and learn",
    href: "/games",
    imageSrc: "/images/hub/games.png",
  },
  {
    title: "My Habit Quest",
    subtitle: "Today's daily challenge",
    href: HABIT_QUEST_HREF,
    imageSrc: "/images/hub/habit-quest.png",
  },
  {
    title: "Ranger",
    subtitle: "Your XP, streak, and badges",
    href: "/ranger",
    imageSrc: "/images/hub/ranger.png",
  },
];

function displayFirstName(fullName: string | null | undefined): string {
  const first = fullName?.trim().split(/\s+/).filter(Boolean)[0];
  if (!first) return "Friend";
  return first.charAt(0).toUpperCase() + first.slice(1);
}

export default function KidHomePage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState<string>("Friend");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("account_type, full_name")
        .eq("id", user.id)
        .maybeSingle();

      if (cancelled) return;

      const accountType = profile?.account_type as string | undefined;
      if (accountType === "parent") {
        router.replace("/dashboard/parent");
        return;
      }
      if (accountType === "teacher") {
        router.replace("/dashboard/teacher");
        return;
      }
      if (accountType !== "student") {
        router.replace("/");
        return;
      }

      setFirstName(displayFirstName(profile?.full_name as string | undefined));
      setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!ready) {
    return (
      <div
        style={{
          ...dottedBg,
          minHeight: "50vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 16px",
          fontFamily: "var(--font-nunito), system-ui, sans-serif",
          color: "#1B4332",
        }}
      >
        <p style={{ margin: 0, fontSize: "1.1rem", fontWeight: 600 }}>Loading your hub…</p>
      </div>
    );
  }

  return (
    <div
      style={{
        ...dottedBg,
        paddingTop: 32,
        paddingBottom: 80,
        paddingLeft: 16,
        paddingRight: 16,
        fontFamily: "var(--font-nunito), system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Welcome banner */}
        <div className="relative mx-auto h-[200px] w-full max-w-[1200px] overflow-hidden rounded-2xl shadow-[0_8px_28px_rgba(27,67,50,0.12)] md:h-[320px]">
          <Image
            src={WELCOME_BANNER_SRC}
            alt=""
            fill
            priority
            sizes="(max-width: 1200px) 100vw, 1200px"
            style={{ objectFit: "cover", objectPosition: "center" }}
          />
          {/* Center dark wash for text legibility (~18% peak) */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 1,
              pointerEvents: "none",
              background:
                "radial-gradient(ellipse 75% 70% at 50% 48%, rgba(27, 43, 34, 0.18) 0%, rgba(27, 43, 34, 0.06) 45%, transparent 72%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: "12px 20px",
            }}
          >
            <h1
              className="text-2xl md:text-4xl"
              style={{
                margin: 0,
                color: "#fff",
                fontWeight: 700,
                lineHeight: 1.2,
                textShadow: "0 2px 12px rgba(0,0,0,0.25)",
              }}
            >
              Welcome back, {firstName}! 🌱
            </h1>
            <p
              className="text-sm md:text-lg"
              style={{
                margin: "10px 0 0",
                color: "#fff",
                fontWeight: 400,
                textShadow: "0 1px 8px rgba(0,0,0,0.22)",
              }}
            >
              What do you want to do today?
            </p>
          </div>
        </div>

        {/* Cards */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          style={{ marginTop: 36 }}
        >
          {HUB_CARDS.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="block cursor-pointer overflow-hidden rounded-[20px] bg-white text-inherit no-underline shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-[transform,box-shadow] duration-200 hover:-translate-y-[4px] hover:shadow-[0_10px_24px_rgba(0,0,0,0.1)]"
            >
              <div
                className="relative w-full overflow-hidden rounded-t-[20px]"
                style={{ aspectRatio: "1 / 1" }}
              >
                <Image
                  src={card.imageSrc}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  style={{ objectFit: "cover", objectPosition: "center" }}
                />
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: "#1B4332",
                  padding: "16px 20px 8px",
                }}
              >
                {card.title}
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: "#4A6355",
                  padding: "0 20px 20px",
                  lineHeight: 1.35,
                }}
              >
                {card.subtitle}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
