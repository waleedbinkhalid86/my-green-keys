"use client";

import Image from "next/image";
import { useState } from "react";
import { SecondaryButton } from "@/components/marketing/Buttons";

export type HomeEcoFact = { topic: string; text: string };

/** Turtle card that cycles through a short list of eco facts. */
export function EcoFactCard({ facts }: { facts: HomeEcoFact[] }) {
  const [index, setIndex] = useState(0);
  if (facts.length === 0) return null;
  const fact = facts[index]!;

  return (
    <div className="mgk-home-factcard">
      <Image
        src="/images/home/turtle-happy.webp"
        alt="A happy cartoon sea turtle"
        width={120}
        height={144}
        sizes="120px"
        className="mgk-home-factcard__turtle"
      />
      <div aria-live="polite" style={{ minHeight: 96 }}>
        <p className="mgk-home-factcard__topic">{fact.topic}</p>
        <p className="mgk-home-factcard__text">{fact.text}</p>
      </div>
      <div className="mgk-home-factcard__foot">
        <span className="mgk-home-factcard__count">
          {index + 1} of {facts.length}
        </span>
        <SecondaryButton onClick={() => setIndex((i) => (i + 1) % facts.length)}>Next fact</SecondaryButton>
      </div>
    </div>
  );
}
