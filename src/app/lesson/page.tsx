"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { Nunito } from "next/font/google";
import { Flame, Shield } from "lucide-react";
import { lessons, phases, type Lesson } from "@/data/lessons";
import { createClient } from "@/lib/supabase/client";
import { getCurrentStreak, updateStreak, type StreakUpdateResult } from "@/lib/streakHelpers";
import { awardXp, getRangerProfile, XP_SOURCES, type XpAwardResult } from "@/lib/rangerHelpers";
import { StreakCounter } from "@/components/StreakCounter";
import { MilestoneCelebration } from "@/components/MilestoneCelebration";
import { RankBadge } from "@/components/RankBadge";
import { RankUpCelebration } from "@/components/RankUpCelebration";
import { ecoFacts, type EcoFact } from "@/data/ecoFacts";
import { getCertificateForMilestone, type CertificateDefinition } from "@/lib/certificates";
import { PetWidget } from "@/components/PetWidget";
import "../globals.css";

const nunito = Nunito({
  weight: ["600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
});

const FINGER_MAP: Record<string, string> = {
  // Left pinky
  "q": "lpinky", "a": "lpinky", "z": "lpinky", "1": "lpinky", "!": "lpinky", "2": "lpinky", "@": "lpinky",
  // Left ring
  "w": "lring", "s": "lring", "x": "lring", "3": "lring", "#": "lring",
  // Left middle
  "e": "lmiddle", "d": "lmiddle", "c": "lmiddle", "4": "lmiddle", "$": "lmiddle",
  // Left index
  "r": "lindex", "f": "lindex", "v": "lindex", "t": "lindex", "y": "lindex", "5": "lindex", "%": "lindex", "6": "lindex", "^": "lindex",
  // Right index
  "u": "rindex", "j": "rindex", "m": "rindex", "7": "rindex", "&": "rindex", "8": "rindex", "*": "rindex",
  // Right middle
  "i": "rmiddle", "k": "rmiddle", ",": "rmiddle", "9": "rmiddle", "(": "rmiddle",
  // Right ring
  "o": "rring", "l": "rring", ".": "rring", "0": "rring", ")": "rring",
  // Right pinky
  "p": "rpinky", ";": "rpinky", "/": "rpinky", "-": "rpinky", "_": "rpinky", "=": "rpinky", "+": "rpinky", "[": "rpinky", "{": "rpinky", "]": "rpinky", "}": "rpinky", "'": "rpinky", "\"": "rpinky",
  " ": "space",
};

const FINGER_NAMES: Record<string, string> = {
  lpinky: "Pinky",
  lring: "Ring",
  lmiddle: "Middle",
  lindex: "Index",
  rindex: "Index",
  rmiddle: "Middle",
  rring: "Ring",
  rpinky: "Pinky",
  space: "Thumb",
};

const KEYBOARD_LAYOUT = [
  { row: 1, keys: ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"] },
  { row: 2, keys: ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";"] },
  { row: 3, keys: ["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"] },
];

/** Territory fills per finger zone (high-visibility, edclub-style). */
const TERRITORY_COLORS: Record<string, string> = {
  lpinky: "#FFD5D5",
  lring: "#FFE8D5",
  lmiddle: "#FFF5D5",
  lindex: "#D5FFE8",
  rindex: "#D5EAFF",
  rmiddle: "#E0D5FF",
  rring: "#FFD5F5",
  rpinky: "#D5FFFF",
  space: "#EEEEEE",
};

const SPECIAL_KEY_ZONE: Record<string, string> = {
  tab: "lpinky",
  caps: "lpinky",
  "shift-l": "lpinky",
  bksp: "rpinky",
  enter: "rpinky",
  "shift-r": "rpinky",
  space: "space",
};

function territoryZoneForKey(id: string, mapId: string | null): string {
  if (mapId === " ") return "space";
  if (mapId) {
    const mapped = FINGER_MAP[mapId];
    if (mapped) return mapped;
    if (mapId === "g" || mapId === "b") return "lindex";
    if (mapId === "h" || mapId === "n") return "rindex";
  }
  return SPECIAL_KEY_ZONE[id] ?? "lpinky";
}

function mixHexWithWhite(hex: string, whiteAmount: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const t = Math.min(1, Math.max(0, whiteAmount));
  const nr = Math.round(r + (255 - r) * t);
  const ng = Math.round(g + (255 - g) * t);
  const nb = Math.round(b + (255 - b) * t);
  const x = (n: number) => n.toString(16).padStart(2, "0");
  return `#${x(nr)}${x(ng)}${x(nb)}`;
}

const EDCLUB_KB_GAP = 3;
const EDCLUB_KB_KEY = 36;
const EDCLUB_KB_RX = 5;
const EDCLUB_KEY_BORDER = "#D0D7DE";
const EDCLUB_KEY_LABEL = "#333333";
const EDCLUB_KEY_SHADOW = "#B0B7BE";

type EdclubPlacedKey = {
  id: string;
  mapId: string | null;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  zone: string;
};

type EdclubKbGeom = {
  keys: EdclubPlacedKey[];
  vbWidth: number;
  vbHeight: number;
  keyboardTop: number;
};

function buildEdclubKeyboardGeometry(): EdclubKbGeom {
  type RowItem =
    | { kind: "special"; id: string; label: string; mult: number }
    | { kind: "letter"; letter: string };

  const rows: RowItem[][] = [
    [
      { kind: "special", id: "tab", label: "Tab", mult: 1.4 },
      ...KEYBOARD_LAYOUT[0].keys.map((letter) => ({ kind: "letter" as const, letter })),
      { kind: "special", id: "bksp", label: "Backspace", mult: 1.4 },
    ],
    [
      { kind: "special", id: "caps", label: "Caps", mult: 1.4 },
      ...KEYBOARD_LAYOUT[1].keys.map((letter) => ({ kind: "letter" as const, letter })),
      { kind: "special", id: "enter", label: "Enter", mult: 1.65 },
    ],
    [
      { kind: "special", id: "shift-l", label: "Shift", mult: 1.65 },
      ...KEYBOARD_LAYOUT[2].keys.map((letter) => ({ kind: "letter" as const, letter })),
      { kind: "special", id: "shift-r", label: "Shift", mult: 1.65 },
    ],
  ];

  const rowWidths = rows.map((row) =>
    row.reduce((sum, item) => {
      const w = item.kind === "special" ? EDCLUB_KB_KEY * item.mult : EDCLUB_KB_KEY;
      return sum + w + EDCLUB_KB_GAP;
    }, -EDCLUB_KB_GAP),
  );

  const keyUnit = EDCLUB_KB_KEY + EDCLUB_KB_GAP;
  /** Q / A / Z row stagger (key widths), like a physical keyboard */
  const rowStagger = [0.5, 0.75, 1.25].map((m) => m * keyUnit);
  const maxStagger = Math.max(...rowStagger);

  const spaceW = EDCLUB_KB_KEY * 6;
  const vbWidth = Math.max(...rowWidths, spaceW) + maxStagger * 2 + 24;

  const keyboardTop = 8;
  const rowYs = [0, 1, 2].map((i) => keyboardTop + i * keyUnit);
  const spaceY = keyboardTop + 3 * keyUnit;

  const keys: EdclubPlacedKey[] = [];

  rows.forEach((row, ri) => {
    const rw = rowWidths[ri];
    let x = (vbWidth - rw) / 2 + rowStagger[ri];
    const y = rowYs[ri];
    for (const item of row) {
      const w = item.kind === "special" ? EDCLUB_KB_KEY * item.mult : EDCLUB_KB_KEY;
      if (item.kind === "letter") {
        const letter = item.letter;
        const zone = territoryZoneForKey(letter, letter);
        keys.push({
          id: letter,
          mapId: letter,
          label: letter === ";" ? ";" : letter.toUpperCase(),
          x,
          y,
          w,
          h: EDCLUB_KB_KEY,
          zone,
        });
      } else {
        const zone = territoryZoneForKey(item.id, null);
        keys.push({
          id: item.id,
          mapId: null,
          label: item.label,
          x,
          y,
          w,
          h: EDCLUB_KB_KEY,
          zone,
        });
      }
      x += w + EDCLUB_KB_GAP;
    }
  });

  const sx = (vbWidth - spaceW) / 2;
  keys.push({
    id: "space",
    mapId: " ",
    label: "Space",
    x: sx,
    y: spaceY,
    w: spaceW,
    h: EDCLUB_KB_KEY,
    zone: "space",
  });

  const vbHeight = spaceY + EDCLUB_KB_KEY + 14;

  return { keys, vbWidth, vbHeight, keyboardTop };
}

const EDCLUB_KB_GEOM = buildEdclubKeyboardGeometry();

/** First index where correction is needed, or length of correct prefix for next key. */
function nextLessonKeyIndex(sentence: string, typed: string): number {
  const n = Math.min(typed.length, sentence.length);
  let i = 0;
  while (i < n && typed[i] === sentence[i]) i++;
  if (i < typed.length && typed[i] !== sentence[i]) return i;
  return typed.length;
}

function normalizeHighlightKey(k: string | null): string | null {
  if (k === null) return null;
  if (k === " ") return " ";
  return k.toLowerCase();
}

function fingerTypeFromHighlight(key: string | null): string {
  if (!key) return "";
  if (key === " ") return "space";
  return FINGER_MAP[key.toLowerCase()] ?? "";
}

function EdclubKeyboardSection({
  highlightKey,
  shakeKey,
  pressedVKey,
  themeColor,
  fontClassName,
  showInstruction,
}: {
  highlightKey: string | null;
  shakeKey: string | null;
  pressedVKey: string | null;
  themeColor: string;
  fontClassName: string;
  showInstruction: boolean;
}) {
  const geom = EDCLUB_KB_GEOM;
  const hk = normalizeHighlightKey(highlightKey);
  const sk = normalizeHighlightKey(shakeKey);
  const pk = normalizeHighlightKey(pressedVKey);
  const fingerHi = fingerTypeFromHighlight(highlightKey);

  const pillLabel =
    highlightKey === null
      ? ""
      : highlightKey === " "
        ? "Space"
        : highlightKey.length === 1
          ? highlightKey.toUpperCase()
          : highlightKey;
  const fingerWord = fingerHi ? FINGER_NAMES[fingerHi] ?? "" : "";

  const territoryForHighlight =
    highlightKey === null
      ? TERRITORY_COLORS.space
      : TERRITORY_COLORS[fingerTypeFromHighlight(highlightKey)] ?? TERRITORY_COLORS.lindex;

  return (
    <div
      className={fontClassName}
      style={{
        background: "#F5F7FA",
        padding: "12px 14px 14px",
        borderRadius: 14,
        marginBottom: 11,
        marginTop: 0,
        boxShadow: "0 10px 28px rgba(15, 23, 42, 0.1), 0 3px 10px rgba(15, 23, 42, 0.06)",
        border: "1px solid rgba(0,0,0,0.06)",
        width: "100%",
        maxWidth: 860,
        marginLeft: "auto",
        marginRight: "auto",
        boxSizing: "border-box",
        overflowX: "auto",
        overflowY: "visible",
      }}
    >
      {showInstruction && (
        <div
          style={{
            marginBottom: 8,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 8,
            fontSize: 15,
            fontWeight: 700,
            color: "#1e293b",
            lineHeight: 1.35,
          }}
        >
          {highlightKey ? (
            <>
              <span>Type the</span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: 40,
                  padding: "5px 16px",
                  borderRadius: 999,
                  background: territoryForHighlight,
                  color: "#333333",
                  fontWeight: 800,
                  fontSize: 22,
                  border: `1px solid ${mixHexWithWhite(territoryForHighlight, 0.25)}`,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                {pillLabel}
              </span>
              <span>
                key
                {fingerWord ? (
                  <>
                    {" "}
                    using your {fingerWord} finger.
                  </>
                ) : (
                  "."
                )}
              </span>
            </>
          ) : (
            <span style={{ color: "#64748b", fontWeight: 700 }}>
              Great job — lesson complete or waiting for the next key.
            </span>
          )}
        </div>
      )}

      <svg
        width="100%"
        height="auto"
        viewBox={`0 0 ${geom.vbWidth} ${geom.vbHeight}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ display: "block", minWidth: geom.vbWidth, minHeight: 195 }}
        aria-hidden
      >
        <rect
          x={4}
          y={geom.keyboardTop - 12}
          width={geom.vbWidth - 8}
          height={geom.vbHeight - geom.keyboardTop + 16}
          rx={10}
          fill="#E8EBEF"
        />

        {geom.keys.map((k) => {
          const active = k.mapId !== null && hk === k.mapId;
          const shaking = k.mapId !== null && sk === k.mapId;
          const pressed = k.mapId !== null && pk === k.mapId;
          const cx = k.x + k.w / 2;
          const cy = k.y + k.h / 2;
          const territory = TERRITORY_COLORS[k.zone] ?? "#EEEEEE";
          const fill = active ? themeColor : territory;
          const stroke = active ? themeColor : EDCLUB_KEY_BORDER;
          const sw = active ? 2.5 : 1;
          const shadow = active
            ? `drop-shadow(0 0 10px ${themeColor}99) drop-shadow(0 0 20px ${themeColor}55) drop-shadow(0 1px 0 #6b7280)`
            : `drop-shadow(0 2px 0 ${EDCLUB_KEY_SHADOW})`;
          const isLetter =
            k.mapId !== null && k.mapId !== " " && k.mapId.length === 1 && /[a-z;,\./]/.test(k.mapId);
          const labelSize = k.label.length > 7 ? 9 : isLetter ? 12 : 11;
          const labelWeight = isLetter ? 800 : 700;
          const labelFill = active ? "#ffffff" : EDCLUB_KEY_LABEL;
          return (
            <g
              key={k.id}
              style={{
                transformOrigin: `${cx}px ${cy}px`,
                transform: pressed ? "scale(0.96)" : "scale(1)",
                transition: "transform 0.08s ease",
                animation: shaking ? "shakeWrong 0.15s ease" : "none",
              }}
            >
              <rect
                x={k.x}
                y={k.y}
                width={k.w}
                height={k.h}
                rx={EDCLUB_KB_RX}
                fill={fill}
                stroke={stroke}
                strokeWidth={sw}
                style={{ filter: shadow }}
              />
              {(k.mapId === "f" || k.mapId === "j") && (
                <rect
                  x={cx - 2.5}
                  y={k.y + k.h - 8}
                  width={5}
                  height={4}
                  rx={2}
                  fill={active ? "rgba(255,255,255,0.85)" : "rgba(51,51,51,0.35)"}
                />
              )}
              <text
                x={cx}
                y={cy}
                className={fontClassName}
                textAnchor="middle"
                dominantBaseline="central"
                fill={labelFill}
                fontSize={labelSize}
                fontWeight={labelWeight}
                style={{ pointerEvents: "none", userSelect: "none" }}
              >
                {k.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

const TYPING_RULES = [
  {
    icon: "🏠",
    title: "HOME ROW",
    description: "Place fingers on A S D F (left) and J K L ; (right). These are your home keys - always return here."
  },
  {
    icon: "🪑",
    title: "POSTURE",
    description: "Sit straight, feet flat. Screen at eye level. Wrists hover - don't rest on keyboard."
  },
  {
    icon: "👆",
    title: "FINGER ZONES",
    description: "Each finger owns specific keys. Never use wrong finger - it builds bad habits."
  },
  {
    icon: "👀",
    title: "EYES ON SCREEN",
    description: "Never look at keyboard. Trust your muscle memory. Eyes stay on the text always."
  },
  {
    icon: "🎯",
    title: "ACCURACY FIRST",
    description: "Slow and correct beats fast and wrong. Accuracy builds speed naturally over time."
  },
  {
    icon: "📅",
    title: "DAILY PRACTICE",
    description: "10-15 minutes daily is perfect. Consistency beats long occasional sessions."
  }
];

interface UserProfile {
  name: string;
  age: number;
  gender: "boy" | "girl";
}

interface LessonStats {
  wpm: number;
  accuracy: number;
  streak: number;
  ecoWords: number;
  startTime: number | null;
}

type EcoActionType = "planting_tree" | "watering_plants" | "water_for_birds";

const ECO_ACTIONS: Array<{
  type: EcoActionType;
  label: string;
  points: number;
}> = [
  { type: "planting_tree", label: "🌱 Planting a tree", points: 500 },
  { type: "watering_plants", label: "💧 Watering plants", points: 300 },
  { type: "water_for_birds", label: "🐦 Water on roof for birds", points: 400 },
];

export default function LessonPage() {
  const [currentLessonId, setCurrentLessonId] = useState(1);
  const [userInput, setUserInput] = useState("");
  const [stats, setStats] = useState<LessonStats>({
    wpm: 0,
    accuracy: 100,
    streak: 0,
    ecoWords: 0,
    startTime: null,
  });
  const [isComplete, setIsComplete] = useState(false);
  const [stars, setStars] = useState(0);
  const [shakeKey, setShakeKey] = useState<string | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [showKeyboardInstruction, setShowKeyboardInstruction] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showLessonMap, setShowLessonMap] = useState(false);
  const [showTypingRulesModal, setShowTypingRulesModal] = useState(false);
  const [showEcoUploadModal, setShowEcoUploadModal] = useState(false);
  const [ecoSelectedAction, setEcoSelectedAction] = useState<EcoActionType | null>(null);
  const [ecoFile, setEcoFile] = useState<File | null>(null);
  const [ecoPreviewUrl, setEcoPreviewUrl] = useState<string>("");
  const [ecoSubmitting, setEcoSubmitting] = useState(false);
  const [ecoMessage, setEcoMessage] = useState<string>("");
  const [ecoError, setEcoError] = useState<string>("");
  const [showJoinClassModal, setShowJoinClassModal] = useState(false);
  const [classCode, setClassCode] = useState("");
  const [joinClassLoading, setJoinClassLoading] = useState(false);
  const [joinClassError, setJoinClassError] = useState("");
  const [joinClassSuccess, setJoinClassSuccess] = useState("");
  const [currentClass, setCurrentClass] = useState<{ id: string; name: string; code: string } | null>(null);

  // Virtual Pet state (stored in Supabase profiles)
  const [petLoading, setPetLoading] = useState(true);
  const [petError, setPetError] = useState("");
  const [showPetSetup, setShowPetSetup] = useState(false);
  const [petType, setPetType] = useState<"panda" | "turtle" | null>(null);
  const [petName, setPetName] = useState("");
  const [petHealth, setPetHealth] = useState(100);
  const [petLastFed, setPetLastFed] = useState<string | null>(null);
  const [petPulse, setPetPulse] = useState(false);
  const [petDance, setPetDance] = useState(false);
  const [wordFlash, setWordFlash] = useState(false);
  const [pressedVKey, setPressedVKey] = useState<string | null>(null);
  const pressedVKeyTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const [ecoDisplay, setEcoDisplay] = useState(0);

  // Onboarding tutorial (3-step, first login only)
  const [studentDisplayName, setStudentDisplayName] = useState<string>("");
  const [onboardingLoading, setOnboardingLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean>(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState<1 | 2 | 3>(1);
  const [onboardingError, setOnboardingError] = useState("");

  // Eco facts UI
  const [dailyFact, setDailyFact] = useState<EcoFact | null>(null);
  const [showDailyFact, setShowDailyFact] = useState(false);
  const [lessonFact, setLessonFact] = useState<EcoFact | null>(null);
  const dailyFactTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Certificates
  const [earnedCertificate, setEarnedCertificate] = useState<(CertificateDefinition & { id: string }) | null>(null);
  const [showCertificatePopup, setShowCertificatePopup] = useState(false);
  const [streakUpdate, setStreakUpdate] = useState<StreakUpdateResult | null>(null);
  const [xpAwarded, setXpAwarded] = useState<XpAwardResult | null>(null);
  const [rangerXp, setRangerXp] = useState(0);
  const [profileDailyStreak, setProfileDailyStreak] = useState(0);
  const [welcomeData, setWelcomeData] = useState({
    name: "",
    age: "8",
    gender: "" as "boy" | "girl" | "",
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const shakeTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const messageTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const petPulseTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const petDanceTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const loadCurrentClass = async () => {
    try {
      const supabase = createClient();
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!userData.user) {
        setCurrentClass(null);
        return;
      }

      const { data: enrollment, error: enrollError } = await supabase
        .from("class_enrollments")
        .select("class_id")
        .eq("student_id", userData.user.id)
        .limit(1)
        .maybeSingle();

      if (enrollError) throw enrollError;
      const classId = (enrollment as { class_id?: string } | null)?.class_id;
      if (!classId) {
        setCurrentClass(null);
        return;
      }

      const { data: cls, error: clsError } = await supabase
        .from("classes")
        .select("id, name, code")
        .eq("id", classId)
        .single();
      if (clsError) throw clsError;
      setCurrentClass(cls as { id: string; name: string; code: string });
    } catch {
      // Non-blocking — lesson should still work even if class lookup fails.
      setCurrentClass(null);
    }
  };

  useEffect(() => {
    if (!ecoFile) {
      setEcoPreviewUrl("");
      return;
    }

    const url = URL.createObjectURL(ecoFile);
    setEcoPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [ecoFile]);

  // Get current lesson data
  const currentLesson = lessons.find(l => l.id === currentLessonId) || lessons[0];
  const currentPhase = phases.find(p => p.id === currentLesson.phase);

  // Initialize from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem("userProfile");
    const savedLessonId = localStorage.getItem("currentLessonId");
    const queryLesson =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("lesson")
        : null;
    
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    } else {
      setShowWelcomeModal(true);
    }
    
    const queryLessonId = queryLesson ? Number(queryLesson) : NaN;
    if (Number.isFinite(queryLessonId) && queryLessonId >= 1 && queryLessonId <= 100) {
      setCurrentLessonId(queryLessonId);
      localStorage.setItem("currentLessonId", String(queryLessonId));
      return;
    }

    if (savedLessonId) setCurrentLessonId(parseInt(savedLessonId));
  }, []);

  useEffect(() => {
    void loadCurrentClass();
  }, []);

  useEffect(() => {
    const run = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;
        const s = await getCurrentStreak(user.id, supabase);
        if (s) setProfileDailyStreak(s.current_streak);
        const ranger = await getRangerProfile(user.id, supabase);
        if (ranger) setRangerXp(ranger.ranger_xp);
      } catch {
        /* non-blocking */
      }
    };
    void run();
  }, []);

  useEffect(() => {
    if (streakUpdate?.newStreak != null) {
      setProfileDailyStreak(streakUpdate.newStreak);
    }
  }, [streakUpdate]);

  const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

  const petMood: "happy" | "neutral" | "sad" =
    petHealth >= 70 ? "happy" : petHealth >= 40 ? "neutral" : "sad";

  const petEmoji = petType === "turtle" ? "🐢" : "🐼";

  const loadPetFromProfile = async () => {
    setPetLoading(true);
    setPetError("");
    try {
      const supabase = createClient();
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!userData.user) {
        setPetError("You must be logged in to use the virtual pet.");
        setShowPetSetup(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, pet_type, pet_name, pet_health, pet_last_fed, onboarding_completed")
        .eq("id", userData.user.id)
        .single();
      if (profileError) throw profileError;

      const onboarding = Boolean((profile as any)?.onboarding_completed);
      setOnboardingCompleted(onboarding);
      setStudentDisplayName(((profile as any)?.full_name as string | null)?.trim() || "");
      setShowOnboarding(!onboarding);
      setOnboardingStep(1);

      const nextPetType = (profile as any)?.pet_type as "panda" | "turtle" | null;
      const nextPetName = ((profile as any)?.pet_name as string | null) ?? "";
      const nextHealth = Number((profile as any)?.pet_health ?? 100);
      const nextLastFed = ((profile as any)?.pet_last_fed as string | null) ?? null;

      setPetType(nextPetType);
      setPetName(nextPetName);
      setPetHealth(clamp(Number.isFinite(nextHealth) ? nextHealth : 100, 0, 100));
      setPetLastFed(nextLastFed);

      // Pet setup screen should not interrupt onboarding; only show as fallback after onboarding.
      if (!onboarding && (!nextPetType || !nextPetName)) {
        setShowPetSetup(false);
      } else {
        setShowPetSetup(!nextPetType || !nextPetName);
      }

      // Health decay: -5 for each full 24h with no feeding (no completed lesson).
      if (nextLastFed) {
        const last = new Date(nextLastFed).getTime();
        if (Number.isFinite(last)) {
          const days = Math.floor((Date.now() - last) / (1000 * 60 * 60 * 24));
          if (days > 0) {
            const dec = days * 5;
            const decayed = clamp(nextHealth - dec, 0, 100);
            if (decayed !== nextHealth) {
              setPetHealth(decayed);
              const { error: updateError } = await supabase
                .from("profiles")
                .update({ pet_health: decayed })
                .eq("id", userData.user.id);
              if (updateError) throw updateError;
            }
          }
        }
      }
    } catch (err) {
      setPetError(err instanceof Error ? err.message : "Failed to load pet.");
    } finally {
      setPetLoading(false);
      setOnboardingLoading(false);
    }
  };

  useEffect(() => {
    void loadPetFromProfile();
    return () => {
      if (petPulseTimeoutRef.current) clearTimeout(petPulseTimeoutRef.current);
      if (petDanceTimeoutRef.current) clearTimeout(petDanceTimeoutRef.current);
      if (dailyFactTimeoutRef.current) clearTimeout(dailyFactTimeoutRef.current);
    };
  }, []);

  const pickEcoFact = (seed: string) => {
    // Simple deterministic hash
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    const idx = h % ecoFacts.length;
    return ecoFacts[idx];
  };

  // Daily login eco fact popup (once per day)
  useEffect(() => {
    const key = "mgk_last_fact_shown";
    const today = new Date().toISOString().slice(0, 10);
    try {
      const last = localStorage.getItem(key);
      if (last === today) return;
      const fact = pickEcoFact(`daily:${today}`);
      setDailyFact(fact);
      setShowDailyFact(true);
      localStorage.setItem(key, today);
      dailyFactTimeoutRef.current = setTimeout(() => setShowDailyFact(false), 5000);
    } catch {
      // ignore localStorage failures
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const savePetSetup = async () => {
    setPetError("");
    try {
      if (!petType) {
        setPetError("Please choose a pet.");
        return;
      }
      if (!petName.trim()) {
        setPetError("Please name your pet.");
        return;
      }

      const supabase = createClient();
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!userData.user) {
        setPetError("You must be logged in to set up your pet.");
        return;
      }

      const now = new Date().toISOString();
      const { error } = await supabase
        .from("profiles")
        .update({
          pet_type: petType,
          pet_name: petName.trim(),
          pet_health: clamp(petHealth, 0, 100),
          pet_last_fed: now,
        })
        .eq("id", userData.user.id);
      if (error) throw error;

      setPetLastFed(now);
      setShowPetSetup(false);
    } catch (err) {
      setPetError(err instanceof Error ? err.message : "Failed to save pet.");
    }
  };

  const saveOnboardingCompleted = async (opts?: { defaultPetIfMissing?: boolean }) => {
    setOnboardingError("");
    try {
      const supabase = createClient();
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!userData.user) {
        setOnboardingError("You must be logged in.");
        return;
      }

      const now = new Date().toISOString();
      const updates: Record<string, unknown> = { onboarding_completed: true };

      if (opts?.defaultPetIfMissing && (!petType || !petName.trim())) {
        updates.pet_type = "panda";
        updates.pet_name = "Buddy";
        updates.pet_health = clamp(petHealth || 100, 0, 100);
        updates.pet_last_fed = now;
        setPetType("panda");
        setPetName("Buddy");
        setPetLastFed(now);
      }

      const { error } = await supabase.from("profiles").update(updates).eq("id", userData.user.id);
      if (error) throw error;

      setOnboardingCompleted(true);
      setShowOnboarding(false);
    } catch (err) {
      setOnboardingError(err instanceof Error ? err.message : "Failed to update onboarding.");
    }
  };

  const savePetFromOnboarding = async (): Promise<boolean> => {
    setOnboardingError("");
    try {
      if (!petType) {
        setOnboardingError("Please choose a companion.");
        return false;
      }
      if (!petName.trim()) {
        setOnboardingError("Please name your pet.");
        return false;
      }

      const supabase = createClient();
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!userData.user) {
        setOnboardingError("You must be logged in.");
        return false;
      }

      const now = new Date().toISOString();
      const { error } = await supabase
        .from("profiles")
        .update({
          pet_type: petType,
          pet_name: petName.trim(),
          pet_health: clamp(petHealth, 0, 100),
          pet_last_fed: now,
        })
        .eq("id", userData.user.id);
      if (error) throw error;

      setPetLastFed(now);
      setShowPetSetup(false);
      return true;
    } catch (err) {
      setOnboardingError(err instanceof Error ? err.message : "Failed to save pet.");
      return false;
    }
  };

  const bumpPetOnce = () => {
    setPetPulse(true);
    if (petPulseTimeoutRef.current) clearTimeout(petPulseTimeoutRef.current);
    petPulseTimeoutRef.current = setTimeout(() => setPetPulse(false), 300);
  };

  // Save current lesson to localStorage
  useEffect(() => {
    localStorage.setItem("currentLessonId", currentLessonId.toString());
  }, [currentLessonId]);

  // Initialize typing
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    // Reset stats for new lesson
    setUserInput("");
    setStats({
      wpm: 0,
      accuracy: 100,
      streak: 0,
      ecoWords: 0,
      startTime: null,
    });
    setEcoDisplay(0);
    setIsComplete(false);
    setStars(0);
    setShowKeyboardInstruction(true);
  }, [currentLessonId]);

  // Calculate WPM and accuracy against the sentence
  useEffect(() => {
    if (userInput.length === 0) return;

    const now = Date.now();
    const startTime = stats.startTime || now;
    const timeInMinutes = (now - startTime) / 1000 / 60;
    const words = userInput.split(" ").length;
    const wpm = Math.max(0, Math.round(words / Math.max(timeInMinutes, 0.016)));

    let correctChars = 0;
    for (let i = 0; i < userInput.length; i++) {
      if (userInput[i] === currentLesson.sentence[i]) correctChars++;
    }
    const accuracy = Math.round((correctChars / userInput.length) * 100);

    setStats((prev) => ({
      ...prev,
      wpm,
      accuracy,
      startTime: prev.startTime || startTime,
    }));
  }, [userInput, stats.startTime, currentLesson]);

  // Calculate streak
  useEffect(() => {
    let streak = 0;
    for (let i = 0; i < userInput.length; i++) {
      if (userInput[i] === currentLesson.sentence[i]) {
        streak++;
      } else {
        break;
      }
    }
    setStats((prev) => ({ ...prev, streak }));
  }, [userInput, currentLesson]);

  // Handle typing input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const lastChar = value[value.length - 1];
    const mapPress = (ch: string) => {
      const k = ch === " " ? " " : ch.toLowerCase();
      setPressedVKey(k);
      if (pressedVKeyTimeoutRef.current) clearTimeout(pressedVKeyTimeoutRef.current);
      pressedVKeyTimeoutRef.current = setTimeout(() => setPressedVKey(null), 100);
    };

    // Check if typed character matches
    if (value.length > userInput.length) {
      setShowKeyboardInstruction(false);
      const cursorBefore = nextLessonKeyIndex(currentLesson.sentence, userInput);
      const expectedChar = currentLesson.sentence[cursorBefore];
      mapPress(lastChar);
      if (lastChar !== expectedChar) {
        setShakeKey(lastChar === " " ? " " : lastChar.toLowerCase());
        shakeTimeoutRef.current = setTimeout(() => setShakeKey(null), 150);
      } else {
        // Correct key pressed
        bumpPetOnce();

        if (lastChar === " " && value.trim().length > 0) {
          const typedWords = value.trimEnd().split(/\s+/).filter(Boolean);
          const targetWords = currentLesson.sentence.split(/\s+/).filter(Boolean);
          const idx = typedWords.length - 1;
          if (idx >= 0 && typedWords[idx] === targetWords[idx]) {
            setWordFlash(true);
            window.setTimeout(() => setWordFlash(false), 200);
          }
        }

        // Encouragement every 5 correct keys
        if (stats.streak > 0 && stats.streak % 5 === 0) {
          const baseMessages = [
            "Great typing! 🌟",
            "You're doing amazing! 💚",
            "Keep it up! 🌱",
            "Fantastic! 🌍",
            "You're a pro! 🎯",
          ];
          
          // Use personalized messages if profile exists
          if (userProfile) {
            const personalized = [
              `Amazing ${userProfile.name}! 🌿`,
              `Keep going ${userProfile.name}! 💪`,
              `You're brilliant ${userProfile.name}! ✨`,
              `${userProfile.name} is on fire! 🔥`,
              `${userProfile.name} rocks! 🎵`,
            ];
            const msg = personalized[Math.floor(Math.random() * personalized.length)];
            setMessages([msg]);
          } else {
            const msg = baseMessages[Math.floor(Math.random() * baseMessages.length)];
            setMessages([msg]);
          }
          messageTimeoutRef.current = setTimeout(() => setMessages([]), 2000);
        }
      }
    }

    setUserInput(value);

    // Check if lesson complete
    if (value === currentLesson.sentence) {
      setIsComplete(true);
      // Calculate stars
      let earnedStars = 1;
      if (stats.accuracy >= 90) earnedStars++;
      if (stats.wpm >= (currentLesson.targetWPM || 20)) earnedStars++;
      setStars(earnedStars);
    }
  };

  // Feed pet on lesson completion (+10 health) and set last fed timestamp.
  useEffect(() => {
    const feedPet = async () => {
      if (!isComplete) return;
      if (!petType || !petName) return;

      setPetDance(true);
      if (petDanceTimeoutRef.current) clearTimeout(petDanceTimeoutRef.current);
      petDanceTimeoutRef.current = setTimeout(() => setPetDance(false), 1400);

      try {
        const supabase = createClient();
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!userData.user) return;

        const nextHealth = clamp(petHealth + 10, 0, 100);
        const now = new Date().toISOString();
        setPetHealth(nextHealth);
        setPetLastFed(now);

        const { error } = await supabase
          .from("profiles")
          .update({ pet_health: nextHealth, pet_last_fed: now })
          .eq("id", userData.user.id);
        if (error) throw error;
      } catch {
        // Non-blocking
      }
    };

    void feedPet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isComplete]);

  // Pick a lesson-linked eco fact when lesson completes
  useEffect(() => {
    if (!isComplete) return;
    const fact = ecoFacts.find((f) => f.lessonId === currentLessonId) ?? pickEcoFact(`lesson:${currentLessonId}`);
    setLessonFact(fact);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isComplete, currentLessonId]);

  // Persist progress + trigger certificates at milestones.
  useEffect(() => {
    const run = async () => {
      if (!isComplete) return;

      try {
        const supabase = createClient();
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!userData.user) return;

        // 1) Mark current lesson as completed in student_progress (update if exists, else insert).
        const existing = await supabase
          .from("student_progress")
          .select("id")
          .eq("student_id", userData.user.id)
          .eq("lesson_id", currentLessonId)
          .maybeSingle();

        const payload: Record<string, unknown> = {
          student_id: userData.user.id,
          lesson_id: currentLessonId,
          completed: true,
          wpm: Number(stats.wpm) || 0,
          accuracy: Number(stats.accuracy) || 0,
          completed_at: new Date().toISOString(),
        };

        if (existing.data?.id) {
          const { error: updErr } = await supabase.from("student_progress").update(payload).eq("id", existing.data.id);
          if (updErr) throw updErr;
        } else {
          const { error: insErr } = await supabase.from("student_progress").insert([payload]);
          if (insErr) throw insErr;
        }

        const user = userData.user;
        if (!user?.id) {
          console.warn("Cannot update streak — no authenticated user");
        } else {
          // Update daily streak (graceful — never blocks completion)
          try {
            const streakResult = await updateStreak(user.id, "lesson", supabase);
            if (streakResult) {
              setStreakUpdate(streakResult);
            }
          } catch (err) {
            console.error("Streak update failed:", err);
            // Continue normally — don't block user
          }
        }

        // Award XP for completing a lesson
        if (user?.id) {
          try {
            let lessonStars = 1;
            if (stats.accuracy >= 90) lessonStars++;
            if (stats.wpm >= (currentLesson.targetWPM || 20)) lessonStars++;

            const baseXp = await awardXp(
              user.id,
              10,
              XP_SOURCES.LESSON_COMPLETE,
              `Completed lesson ${currentLesson.id}: ${currentLesson.title}`,
              supabase
            );

            let bonusResult: XpAwardResult | null = null;
            if (lessonStars === 3) {
              bonusResult = await awardXp(
                user.id,
                5,
                XP_SOURCES.LESSON_THREE_STARS,
                `3-star bonus: lesson ${currentLesson.id}`,
                supabase
              );
            }

            const finalTotal = bonusResult?.totalXp ?? baseXp?.totalXp ?? 0;
            const combinedRankUp = !!(baseXp?.rankUp || bonusResult?.rankUp);
            const lastResult = bonusResult ?? baseXp;
            if (lastResult) {
              setRangerXp(finalTotal);
              setXpAwarded({
                ...lastResult,
                totalXp: finalTotal,
                rankUp: combinedRankUp,
                rankAfter: bonusResult?.rankAfter ?? baseXp?.rankAfter ?? lastResult.rankAfter,
                rankBefore: baseXp?.rankBefore ?? bonusResult?.rankBefore ?? lastResult.rankBefore,
                awarded: (baseXp?.awarded ?? 0) + (bonusResult?.awarded ?? 0),
              });
            }
          } catch (err) {
            console.error("XP award failed:", err);
          }
        }

        // 2) Count completed lessons
        const { data: countRows, error: countErr } = await supabase
          .from("student_progress")
          .select("lesson_id, completed")
          .eq("student_id", userData.user.id)
          .eq("completed", true);
        if (countErr) throw countErr;
        const completedLessons = (countRows ?? []).length;

        const certDef = getCertificateForMilestone(completedLessons);
        if (!certDef) return;

        // 3) Ensure we only create it once
        const existingCert = await supabase
          .from("certificates")
          .select("id")
          .eq("student_id", userData.user.id)
          .eq("lessons_completed", certDef.milestone)
          .maybeSingle();

        if (existingCert.data?.id) {
          setEarnedCertificate({ ...certDef, id: existingCert.data.id as string });
          setShowCertificatePopup(true);
          return;
        }

        // Eco points total (prefer profiles.eco_points; exists in schema)
        const { data: profileRow } = await supabase.from("profiles").select("eco_points").eq("id", userData.user.id).maybeSingle();
        const ecoPointsTotal = Number((profileRow as any)?.eco_points ?? 0) || 0;

        const { data: newCert, error: certErr } = await supabase
          .from("certificates")
          .insert([
            {
              student_id: userData.user.id,
              certificate_type: certDef.type,
              lessons_completed: certDef.milestone,
              wpm: Number(stats.wpm) || 0,
              accuracy: Number(stats.accuracy) || 0,
              eco_points: ecoPointsTotal,
            },
          ])
          .select("id")
          .single();
        if (certErr) throw certErr;

        setEarnedCertificate({ ...certDef, id: (newCert as any)?.id as string });
        setShowCertificatePopup(true);
      } catch {
        // Non-blocking: certificates shouldn't break lesson flow
      }
    };

    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isComplete]);

  const handleNextLesson = () => {
    if (currentLessonId < 100) {
      setCurrentLessonId(currentLessonId + 1);
    }
  };

  const handlePrevLesson = () => {
    if (currentLessonId > 1) {
      setCurrentLessonId(currentLessonId - 1);
    }
  };

  const handleSelectLesson = (lessonId: number) => {
    setCurrentLessonId(lessonId);
    setShowLessonMap(false);
  };

  const handleReset = () => {
    setUserInput("");
    setIsComplete(false);
    setStats({
      wpm: 0,
      accuracy: 100,
      streak: 0,
      ecoWords: 0,
      startTime: null,
    });
    setEcoDisplay(0);
    setStars(0);
    setMessages([]);
    setShowKeyboardInstruction(true);
    if (inputRef.current) inputRef.current.focus();
  };

  const handleSubmitEcoPhoto = async () => {
    setEcoError("");
    setEcoMessage("");

    if (!ecoSelectedAction) {
      setEcoError("Please choose an eco action.");
      return;
    }
    if (!ecoFile) {
      setEcoError("Please upload a photo.");
      return;
    }

    const action = ECO_ACTIONS.find((a) => a.type === ecoSelectedAction);
    if (!action) {
      setEcoError("Invalid eco action.");
      return;
    }

    setEcoSubmitting(true);
    try {
      const supabase = createClient();

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!userData.user) {
        setEcoError("You must be logged in to submit a photo.");
        return;
      }

      const studentId = userData.user.id;
      const safeName = ecoFile.name.replace(/[^\w.\-]+/g, "_");
      const objectPath = `${studentId}/${Date.now()}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from("eco-photos")
        .upload(objectPath, ecoFile, {
          cacheControl: "3600",
          upsert: false,
          contentType: ecoFile.type || undefined,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("eco-photos")
        .getPublicUrl(objectPath);

      const photoUrl = publicUrlData.publicUrl;

      const { error: insertError } = await supabase.from("eco_photos").insert([
        {
          student_id: studentId,
          action_type: action.type,
          photo_url: photoUrl,
          status: "pending",
          points_awarded: action.points,
        },
      ]);

      if (insertError) throw insertError;

      setEcoMessage("Photo submitted! Waiting for parent approval 🌿");
      setEcoFile(null);
      setEcoSelectedAction(null);
      setShowEcoUploadModal(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to submit photo.";
      setEcoError(message);
    } finally {
      setEcoSubmitting(false);
    }
  };

  const handleJoinClass = async () => {
    setJoinClassError("");
    setJoinClassSuccess("");
    setJoinClassLoading(true);
    try {
      const code = classCode.trim().toUpperCase();
      if (!code) {
        setJoinClassError("Please enter a class code.");
        return;
      }
      const supabase = createClient();
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!userData.user) {
        setJoinClassError("You must be logged in to join a class.");
        return;
      }

      const { data: cls, error: clsError } = await supabase
        .from("classes")
        .select("id, name, code")
        .eq("code", code)
        .single();
      if (clsError) throw clsError;

      const classId = (cls as { id: string }).id;
      const { error: enrollError } = await supabase
        .from("class_enrollments")
        .upsert(
          { class_id: classId, student_id: userData.user.id },
          { onConflict: "class_id,student_id" }
        );
      if (enrollError) throw enrollError;

      setJoinClassSuccess(`Joined class: ${(cls as { name?: string }).name || code}`);
      setShowJoinClassModal(false);
      setClassCode("");
      await loadCurrentClass();
    } catch (err) {
      setJoinClassError(err instanceof Error ? err.message : "Failed to join class.");
    } finally {
      setJoinClassLoading(false);
    }
  };

  const progressPercent = (userInput.length / currentLesson.sentence.length) * 100;
  const lessonProgress = ((currentLessonId - 1) / 100) * 100;

  const lessonKeyIndex = nextLessonKeyIndex(currentLesson.sentence, userInput);
  const guideHighlightKey =
    lessonKeyIndex < currentLesson.sentence.length
      ? currentLesson.sentence[lessonKeyIndex]
      : null;

  useEffect(() => {
    setShowKeyboardInstruction(true);
  }, [lessonKeyIndex, currentLessonId]);

  const ecoWordCount = useMemo(() => {
    const targetWords = currentLesson.sentence.trim().split(/\s+/).filter(Boolean);
    if (!userInput.length) return 0;
    const raw = userInput.trimEnd().split(/\s+/).filter(Boolean);
    const complete =
      userInput.endsWith(" ") || userInput === currentLesson.sentence ? raw : raw.slice(0, -1);
    let n = 0;
    for (let i = 0; i < complete.length && i < targetWords.length; i++) {
      if (complete[i] === targetWords[i]) n++;
      else break;
    }
    return n;
  }, [userInput, currentLesson.sentence]);

  const ecoPointsEarnedThisLesson = useMemo(() => {
    if (userInput !== currentLesson.sentence) return ecoWordCount;
    return currentLesson.sentence.trim().split(/\s+/).filter(Boolean).length;
  }, [userInput, currentLesson.sentence, ecoWordCount]);

  useEffect(() => {
    setStats((prev) => (prev.ecoWords === ecoWordCount ? prev : { ...prev, ecoWords: ecoWordCount }));
  }, [ecoWordCount]);

  useEffect(() => {
    if (ecoDisplay === ecoWordCount) return;
    const id = window.setInterval(() => {
      setEcoDisplay((d) => {
        if (d === ecoWordCount) return d;
        return d < ecoWordCount ? d + 1 : d - 1;
      });
    }, 22);
    return () => window.clearInterval(id);
  }, [ecoWordCount, ecoDisplay]);

  const handleWelcomeSubmit = () => {
    const trimmed = welcomeData.name.trim();
    if (trimmed && welcomeData.gender) {
      const profile: UserProfile = {
        name: trimmed,
        age: parseInt(welcomeData.age, 10),
        gender: welcomeData.gender,
      };
      setUserProfile(profile);
      localStorage.setItem("userProfile", JSON.stringify(profile));
      setShowWelcomeModal(false);
    }
  };

  // Determine color theme based on gender
  const getThemeColor = () => {
    if (!userProfile) return "#2ECC71";
    return userProfile.gender === "boy" ? "#4A90D9" : "#FF6B9D";
  };

  return (
    <div
      className={`${nunito.className} min-h-screen bg-[#FAFAFA] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[length:18px_18px] antialiased`}
      style={{
        color: "#2C3E50",
        fontFamily: "Nunito, system-ui, -apple-system, Segoe UI, sans-serif",
      }}
    >
      {/* CERTIFICATE POPUP */}
      {showCertificatePopup && earnedCertificate && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 2700,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 18,
          }}
          role="dialog"
          aria-label="Certificate earned"
        >
          <div
            style={{
              width: "min(680px, 96vw)",
              background: "linear-gradient(135deg,#E8F5E9 0%, #FFFFFF 55%, #FFFDE7 100%)",
              borderRadius: 20,
              border: "1px solid rgba(255,255,255,0.7)",
              boxShadow: "0 22px 70px rgba(0,0,0,0.28)",
              padding: 20,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <button
              type="button"
              onClick={() => setShowCertificatePopup(false)}
              className="no-print"
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                width: 36,
                height: 36,
                borderRadius: 12,
                border: "1px solid rgba(0,0,0,0.08)",
                background: "rgba(255,255,255,0.9)",
                fontWeight: 900,
                cursor: "pointer",
              }}
              aria-label="Close"
            >
              ✕
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontSize: 38 }}>{earnedCertificate.emoji}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 950, color: "#2e7d32", letterSpacing: "0.12em" }}>
                  🎉 YOU EARNED A CERTIFICATE!
                </div>
                <div style={{ fontSize: 22, fontWeight: 950, color: "#2c3e50", marginTop: 4 }}>
                  {earnedCertificate.title}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 14, color: "#2c3e50", fontWeight: 800, lineHeight: 1.5 }}>
              Amazing work—keep typing to help the planet!
            </div>

            <div className="no-print" style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => window.open(`/certificate?id=${encodeURIComponent(earnedCertificate.id)}`, "_blank")}
                style={{
                  padding: "12px 14px",
                  borderRadius: 14,
                  border: "none",
                  background: "#4CAF50",
                  color: "white",
                  fontWeight: 950,
                  cursor: "pointer",
                }}
              >
                View Certificate
              </button>
              <button
                type="button"
                onClick={() =>
                  window.open(`/certificate?id=${encodeURIComponent(earnedCertificate.id)}&print=1`, "_blank")
                }
                style={{
                  padding: "12px 14px",
                  borderRadius: 14,
                  border: "1px solid rgba(76,175,80,0.45)",
                  background: "white",
                  color: "#2e7d32",
                  fontWeight: 950,
                  cursor: "pointer",
                }}
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
      {/* DAILY FACT POPUP */}
      {showDailyFact && dailyFact && (
        <div
          style={{
            position: "fixed",
            top: 16,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 2600,
            width: "min(680px, 92vw)",
          }}
        >
          <div
            className="fact-popup"
            style={{
              background:
                "linear-gradient(135deg, rgba(45,106,79,0.95) 0%, rgba(76,175,80,0.92) 60%, rgba(255,235,59,0.75) 100%)",
              border: "1px solid rgba(255,255,255,0.22)",
              borderRadius: 18,
              boxShadow: "0 18px 60px rgba(0,0,0,0.22)",
              padding: 16,
              color: "white",
              position: "relative",
              overflow: "hidden",
            }}
            onClick={() => setShowDailyFact(false)}
            role="dialog"
            aria-label="Daily eco fact"
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowDailyFact(false);
              }}
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                width: 34,
                height: 34,
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.25)",
                background: "rgba(0,0,0,0.18)",
                color: "white",
                fontWeight: 900,
                cursor: "pointer",
              }}
              aria-label="Close"
            >
              ✕
            </button>

            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ fontSize: 34, lineHeight: 1 }}>{dailyFact.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 950, fontSize: 14 }}>Did you know? 🌍</div>
                <div style={{ fontWeight: 900, fontSize: 18, marginTop: 6, lineHeight: 1.25 }}>
                  {dailyFact.fact}
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                  <span
                    style={{
                      background: "rgba(255,255,255,0.18)",
                      border: "1px solid rgba(255,255,255,0.22)",
                      padding: "4px 10px",
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 900,
                    }}
                  >
                    {dailyFact.category}
                  </span>
                  <span style={{ fontSize: 12, opacity: 0.9, fontWeight: 800 }}>
                    Source: {dailyFact.source}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ONBOARDING OVERLAY */}
      {showOnboarding && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 2500,
            background:
              "linear-gradient(180deg,#162d1e 0%,#1f4d35 25%,#2d6a4f 55%,#52b788 80%,#81c99e 100%)",
            overflow: "hidden",
          }}
        >
          {/* Animated leaves */}
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="onb-leaf"
              style={{
                left: `${(i * 9) % 95}%`,
                animationDelay: `${i * 0.6}s`,
                animationDuration: `${7 + (i % 4)}s`,
              }}
            />
          ))}

          {/* Trees at bottom */}
          <div className="onb-trees" aria-hidden />

          {/* Skip */}
          <button
            type="button"
            onClick={() => void saveOnboardingCompleted({ defaultPetIfMissing: true })}
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              background: "rgba(255,255,255,0.14)",
              border: "1px solid rgba(255,255,255,0.22)",
              color: "rgba(255,255,255,0.9)",
              padding: "8px 12px",
              borderRadius: 999,
              fontWeight: 800,
              cursor: "pointer",
              zIndex: 3,
            }}
          >
            Skip
          </button>

          <div
            style={{
              position: "relative",
              zIndex: 2,
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 18,
            }}
          >
            <div
              style={{
                width: "min(760px, 94vw)",
                background: "rgba(255,255,255,0.92)",
                border: "1px solid rgba(0,0,0,0.06)",
                borderRadius: 20,
                boxShadow: "0 18px 60px rgba(0,0,0,0.25)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "flex",
                  transform: `translateX(-${(onboardingStep - 1) * 100}%)`,
                  transition: "transform 400ms ease",
                  width: "100%",
                }}
              >
                {/* STEP 1 */}
                <div style={{ flex: "0 0 100%", width: "100%", padding: 26 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: "0.18em", color: "#2d6a4f" }}>
                      STEP 1/3
                    </div>
                    <div style={{ fontSize: 34, fontWeight: 950, color: "#2c3e50", marginTop: 10, lineHeight: 1.15 }}>
                      Welcome to My Green Keys{studentDisplayName ? `, ${studentDisplayName}` : ""}! 🌿
                    </div>
                    <div style={{ marginTop: 10, color: "#6b7280", fontSize: 16, fontWeight: 700 }}>
                      Learn to type while helping the planet!
                    </div>
                  </div>

                  <div style={{ marginTop: 22, display: "grid", gap: 12 }}>
                    <div className="onb-heroTrees" />
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <button
                        type="button"
                        onClick={() => setOnboardingStep(2)}
                        style={{
                          padding: "14px 20px",
                          borderRadius: 999,
                          border: "none",
                          background: "#4CAF50",
                          color: "white",
                          fontWeight: 900,
                          fontSize: 16,
                          cursor: "pointer",
                        }}
                      >
                        Let&apos;s Start! →
                      </button>
                    </div>
                  </div>
                </div>

                {/* STEP 2 */}
                <div style={{ flex: "0 0 100%", width: "100%", padding: 26 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: "0.18em", color: "#2d6a4f" }}>
                      STEP 2/3
                    </div>
                    <div style={{ fontSize: 30, fontWeight: 950, color: "#2c3e50", marginTop: 10 }}>
                      Choose your companion!
                    </div>
                    <div style={{ marginTop: 8, color: "#6b7280", fontSize: 14, fontWeight: 700 }}>
                      Your pet stays healthy when you type every day! 🌱
                    </div>
                  </div>

                  {onboardingError && (
                    <div style={{ marginTop: 14, background: "#ffebee", border: "1px solid #ef5350", color: "#c62828", padding: "10px 12px", borderRadius: 12, fontWeight: 900 }}>
                      {onboardingError}
                    </div>
                  )}

                  <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <button
                      type="button"
                      onClick={() => setPetType("panda")}
                      style={{
                        borderRadius: 18,
                        border: petType === "panda" ? "3px solid #4CAF50" : "1px solid #e0e0e0",
                        background: petType === "panda" ? "#E8F5E9" : "white",
                        padding: 16,
                        textAlign: "left",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ fontSize: 42 }}>🐼</div>
                      <div style={{ fontWeight: 950, color: "#2c3e50", marginTop: 6 }}>Panda</div>
                      <div style={{ color: "#6b7280", fontWeight: 700, fontSize: 13, marginTop: 2 }}>Friendly and playful.</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPetType("turtle")}
                      style={{
                        borderRadius: 18,
                        border: petType === "turtle" ? "3px solid #4CAF50" : "1px solid #e0e0e0",
                        background: petType === "turtle" ? "#E8F5E9" : "white",
                        padding: 16,
                        textAlign: "left",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ fontSize: 42 }}>🐢</div>
                      <div style={{ fontWeight: 950, color: "#2c3e50", marginTop: 6 }}>Turtle</div>
                      <div style={{ color: "#6b7280", fontWeight: 700, fontSize: 13, marginTop: 2 }}>Calm and steady.</div>
                    </button>
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <label style={{ display: "block", fontWeight: 900, color: "#2c3e50", marginBottom: 6 }}>
                      Name your pet
                    </label>
                    <input
                      value={petName}
                      onChange={(e) => setPetName(e.target.value)}
                      placeholder="e.g. Bamboo"
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: 14,
                        border: "2px solid #e0e0e0",
                        fontSize: 16,
                        fontWeight: 800,
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                    <button
                      type="button"
                      onClick={() => setOnboardingStep(1)}
                      style={{
                        flex: 1,
                        padding: "12px 14px",
                        borderRadius: 14,
                        border: "1px solid #e0e0e0",
                        background: "white",
                        fontWeight: 950,
                        cursor: "pointer",
                      }}
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        const ok = await savePetFromOnboarding();
                        if (ok) setOnboardingStep(3);
                      }}
                      style={{
                        flex: 1,
                        padding: "12px 14px",
                        borderRadius: 14,
                        border: "none",
                        background: "#4CAF50",
                        color: "white",
                        fontWeight: 950,
                        cursor: "pointer",
                      }}
                    >
                      Next →
                    </button>
                  </div>
                </div>

                {/* STEP 3 */}
                <div style={{ flex: "0 0 100%", width: "100%", padding: 26 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: "0.18em", color: "#2d6a4f" }}>
                      STEP 3/3
                    </div>
                    <div style={{ fontSize: 30, fontWeight: 950, color: "#2c3e50", marginTop: 10 }}>
                      Here&apos;s how My Green Keys works!
                    </div>
                  </div>

                  <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
                    {[
                      { icon: "⌨️", title: "Type lessons to improve your speed" },
                      { icon: "🌿", title: "Earn eco points with nature sentences" },
                      { icon: "📸", title: "Upload eco photos for bonus rewards" },
                      { icon: "🏆", title: "Earn badges and climb leaderboard" },
                    ].map((c, idx) => (
                      <div
                        key={idx}
                        className="onb-card"
                        style={{ animationDelay: `${idx * 140}ms` }}
                      >
                        <div style={{ fontSize: 22 }}>{c.icon}</div>
                        <div style={{ fontWeight: 950, color: "#2c3e50" }}>{c.title}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 16 }}>
                    <span className="onb-dot onb-dot-off" />
                    <span className="onb-dot onb-dot-off" />
                    <span className="onb-dot" />
                  </div>

                  <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                    <button
                      type="button"
                      onClick={() => setOnboardingStep(2)}
                      style={{
                        flex: 1,
                        padding: "12px 14px",
                        borderRadius: 14,
                        border: "1px solid #e0e0e0",
                        background: "white",
                        fontWeight: 950,
                        cursor: "pointer",
                      }}
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await saveOnboardingCompleted();
                        window.location.href = "/lesson";
                      }}
                      style={{
                        flex: 1,
                        padding: "12px 14px",
                        borderRadius: 14,
                        border: "none",
                        background: "#FFEB3B",
                        color: "#1B4D30",
                        fontWeight: 950,
                        cursor: "pointer",
                      }}
                    >
                      Start Typing! 🚀
                    </button>
                  </div>
                </div>
              </div>

              {/* Dots */}
              <div style={{ display: "flex", justifyContent: "center", gap: 8, padding: "0 0 18px" }}>
                <span className={`onb-dot ${onboardingStep === 1 ? "" : "onb-dot-off"}`} />
                <span className={`onb-dot ${onboardingStep === 2 ? "" : "onb-dot-off"}`} />
                <span className={`onb-dot ${onboardingStep === 3 ? "" : "onb-dot-off"}`} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PET SETUP (first time) */}
      {!showOnboarding && showPetSetup && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
            padding: 16,
          }}
        >
          <div
            style={{
              background: "white",
              padding: 28,
              borderRadius: 18,
              width: "min(680px, 94vw)",
              boxShadow: "0 12px 50px rgba(0,0,0,0.35)",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: 14 }}>
              <div style={{ fontSize: "12px", fontWeight: 900, letterSpacing: "0.18em", color: "#4CAF50" }}>
                VIRTUAL PET
              </div>
              <div style={{ fontSize: "28px", fontWeight: 900, color: "#2c3e50", marginTop: 6 }}>
                Choose Your Pet
              </div>
              <div style={{ color: "#666", marginTop: 6 }}>
                Complete lessons to keep your pet healthy and happy.
              </div>
            </div>

            {petError && (
              <div style={{ background: "#ffebee", border: "1px solid #ef5350", color: "#c62828", padding: "10px 12px", borderRadius: 12, marginBottom: 12, fontSize: "13px", fontWeight: 800 }}>
                {petError}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              <button
                type="button"
                onClick={() => setPetType("panda")}
                style={{
                  borderRadius: 16,
                  border: petType === "panda" ? "3px solid #4CAF50" : "1px solid #e0e0e0",
                  background: petType === "panda" ? "#E8F5E9" : "#fff",
                  padding: 18,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div style={{ fontSize: 42, lineHeight: 1 }}>🐼</div>
                <div style={{ fontWeight: 900, color: "#2c3e50", marginTop: 8 }}>Panda</div>
                <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>Loves typing streaks.</div>
              </button>

              <button
                type="button"
                onClick={() => setPetType("turtle")}
                style={{
                  borderRadius: 16,
                  border: petType === "turtle" ? "3px solid #4CAF50" : "1px solid #e0e0e0",
                  background: petType === "turtle" ? "#E8F5E9" : "#fff",
                  padding: 18,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div style={{ fontSize: 42, lineHeight: 1 }}>🐢</div>
                <div style={{ fontWeight: 900, color: "#2c3e50", marginTop: 8 }}>Turtle</div>
                <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>Slow and steady typer.</div>
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
              <label style={{ fontWeight: 900, color: "#2c3e50" }}>Pet name</label>
              <input
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                placeholder="e.g. Bamboo"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: "2px solid #e0e0e0",
                  fontSize: 16,
                  fontWeight: 700,
                }}
              />
            </div>

            <button
              type="button"
              onClick={() => void savePetSetup()}
              style={{
                width: "100%",
                marginTop: 14,
                padding: "14px 16px",
                borderRadius: 14,
                border: "none",
                background: "#4CAF50",
                color: "white",
                fontWeight: 900,
                cursor: "pointer",
                fontSize: 16,
              }}
            >
              Save Pet
            </button>
          </div>
        </div>
      )}
      {/* JOIN CLASS MODAL */}
      {showJoinClassModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1004,
            padding: 16,
          }}
        >
          <div
            style={{
              background: "white",
              padding: 24,
              borderRadius: 16,
              width: "min(520px, 92vw)",
              boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: "22px", fontWeight: 900, color: "#2c3e50" }}>Join Class</div>
                <div style={{ fontSize: "13px", color: "#666", marginTop: 4 }}>
                  Enter your 6-character class code (example: GRN42X).
                </div>
              </div>
              <button
                onClick={() => setShowJoinClassModal(false)}
                style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#999" }}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {joinClassError && (
              <div style={{ background: "#ffebee", border: "1px solid #ef5350", color: "#c62828", padding: "10px 12px", borderRadius: 12, marginBottom: 12, fontSize: "13px", fontWeight: 700 }}>
                {joinClassError}
              </div>
            )}

            <input
              value={classCode}
              onChange={(e) => setClassCode(e.target.value.toUpperCase())}
              placeholder="GRN42X"
              maxLength={6}
              disabled={joinClassLoading}
              style={{
                width: "100%",
                padding: "12px 14px",
                border: "2px solid #e0e0e0",
                borderRadius: 12,
                fontSize: "18px",
                letterSpacing: "0.12em",
                fontWeight: 900,
                color: "#2c3e50",
              }}
            />

            <div style={{ display: "flex", gap: 12, marginTop: 14 }}>
              <button
                type="button"
                onClick={() => setShowJoinClassModal(false)}
                disabled={joinClassLoading}
                style={{
                  flex: 1,
                  padding: "12px 14px",
                  background: "white",
                  border: "1px solid #e0e0e0",
                  borderRadius: 12,
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleJoinClass()}
                disabled={joinClassLoading}
                style={{
                  flex: 1,
                  padding: "12px 14px",
                  background: joinClassLoading ? "#bbb" : "#4CAF50",
                  border: "none",
                  borderRadius: 12,
                  fontWeight: 900,
                  color: "white",
                  cursor: joinClassLoading ? "not-allowed" : "pointer",
                }}
              >
                {joinClassLoading ? "Joining..." : "Join"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOP NAV BAR */}
      <nav
        style={{
          background: "#1A2F23",
          color: "#ffffff",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          className="mgk-container flex flex-wrap items-center justify-between gap-3 py-3"
        >
          {/* Left: back + brand only (lesson meta lives in strip below) */}
          <div className="flex min-w-0 shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={() => window.history.back()}
              style={{
                width: 38,
                height: 38,
                borderRadius: 50,
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(255,255,255,0.06)",
                color: "#fff",
                fontWeight: 900,
                cursor: "pointer",
              }}
              aria-label="Back"
            >
              ←
            </button>
            <div style={{ fontWeight: 950, letterSpacing: "-0.01em" }}>
              <div style={{ fontSize: 14, opacity: 0.85 }}>My Green Keys</div>
            </div>
          </div>

          {/* Right: stats + actions + pet */}
          <div className="flex min-w-0 flex-1 items-center justify-end gap-3 sm:gap-3.5 flex-wrap">
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 16, fontWeight: 950, color: "#2ECC71" }}>{stats.wpm}</div>
                <div style={{ fontSize: 11, opacity: 0.78, fontWeight: 800 }}>WPM</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 16, fontWeight: 950, color: "#2ECC71" }}>{stats.accuracy}%</div>
                <div style={{ fontSize: 11, opacity: 0.78, fontWeight: 800 }}>Accuracy</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 16, fontWeight: 950, color: "#F39C12" }}>{stats.streak} 🔥</div>
                <div style={{ fontSize: 11, opacity: 0.78, fontWeight: 800 }}>Streak</div>
              </div>
            </div>

            {profileDailyStreak > 0 ? (
              <StreakCounter streak={profileDailyStreak} variant="inline" className="!shadow-none" />
            ) : null}

            <Link
              href="/streak"
              style={{
                padding: "10px 14px",
                borderRadius: 50,
                border: "1px solid rgba(255,255,255,0.22)",
                background: "rgba(255,255,255,0.06)",
                color: "#fff",
                fontWeight: 900,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                textDecoration: "none",
              }}
            >
              <Flame size={18} aria-hidden />
              Streak
            </Link>

            <Link
              href="/ranger"
              className="hidden md:inline-flex"
              style={{
                padding: "10px 14px",
                borderRadius: 50,
                border: "1px solid rgba(255,255,255,0.22)",
                background: "rgba(255,255,255,0.06)",
                color: "#fff",
                fontWeight: 900,
                cursor: "pointer",
                alignItems: "center",
                gap: 8,
                textDecoration: "none",
              }}
            >
              <Shield size={18} aria-hidden />
              Ranger
            </Link>

            <Link
              href="/ranger"
              className="hidden md:inline-flex items-center"
              style={{ textDecoration: "none" }}
            >
              <RankBadge xp={rangerXp} variant="compact" />
            </Link>

            {userProfile?.name && (
              <div style={{ fontSize: 13, fontWeight: 900, opacity: 0.92, whiteSpace: "nowrap" }}>
                Hi {userProfile.name}!
              </div>
            )}

            <button
              type="button"
              onClick={() => (window.location.href = "/lesson-map")}
              style={{
                padding: "10px 14px",
                borderRadius: 50,
                border: "1px solid rgba(255,255,255,0.22)",
                background: "rgba(255,255,255,0.06)",
                color: "#fff",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              Lesson Map
            </button>
            <button
              type="button"
              onClick={() => (window.location.href = "/games")}
              style={{
                padding: "10px 14px",
                borderRadius: 50,
                border: "1px solid rgba(255,255,255,0.22)",
                background: "rgba(255,255,255,0.06)",
                color: "#fff",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              Games
            </button>

            {/* Pet widget (compact — desktop uses PetWidget on typing card) */}
            <div
              className="nav-pet-wrap flex md:hidden"
              style={{ alignItems: "center", gap: 10, paddingLeft: 4 }}
            >
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, fontWeight: 900, opacity: 0.85, lineHeight: 1.1 }}>
                  {petName || "My Pet"}
                </div>
                <div
                  style={{
                    width: 56,
                    height: 6,
                    background: "rgba(255,255,255,0.18)",
                    borderRadius: 999,
                    overflow: "hidden",
                    marginTop: 6,
                    border: "1px solid rgba(255,255,255,0.14)",
                  }}
                  aria-label="Pet health"
                >
                  <div
                    className="pet-health-fill"
                    style={{
                      width: `${clamp(petHealth, 0, 100)}%`,
                      height: "100%",
                      background:
                        petMood === "happy"
                          ? "#2ECC71"
                          : petMood === "neutral"
                            ? "#F39C12"
                            : "#E67E22",
                    }}
                  />
                </div>
              </div>
              <div
                className={[
                  "pet",
                  "nav-pet-emoji",
                  `pet-${petMood}`,
                  petPulse ? "pet-pulse" : "",
                  petDance ? "pet-dance" : "",
                ].join(" ")}
                style={{ borderRadius: 16, display: "grid", placeItems: "center" }}
                aria-label="Pet"
              >
                {petEmoji}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* LESSON INFO STRIP (minimal) */}
      <div
        style={{
          background: "#F8F9FA",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          gap: 8,
          fontWeight: 800,
        }}
      >
        <div
          className="mgk-container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 8,
            paddingBottom: 8,
            gap: 8,
          }}
        >
          <div style={{ minWidth: 0, overflow: "hidden" }}>
            <div style={{ fontSize: 11, fontWeight: 900, opacity: 0.75, marginBottom: 3, letterSpacing: "0.02em" }}>
              Lesson {currentLessonId} of 100 <span style={{ opacity: 0.55 }}>·</span> 📚 {currentPhase?.name ?? "Typing"}
            </div>
            <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              <span style={{ fontWeight: 950 }}>{currentLesson.title}</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 220, justifyContent: "flex-end" }}>
            <span style={{ fontSize: 11, opacity: 0.85 }}>
              Target: <span style={{ fontWeight: 950 }}>{currentLesson.targetWPM || 20} WPM</span>
            </span>
            <div style={{ width: 140, height: 8, borderRadius: 999, background: "#ffffff", border: "1px solid rgba(0,0,0,0.08)", overflow: "hidden" }}>
              <div
                className="lesson-strip-progress-fill"
                style={{
                  width: `${lessonProgress}%`,
                  height: "100%",
                  background: "linear-gradient(90deg,#2ECC71,#1A8F4E)",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {joinClassSuccess && (
        <div style={{ background: "#E8F5E9", borderBottom: "1px solid #4CAF50", color: "#2e7d32", fontWeight: 800 }}>
          <div className="mgk-container" style={{ paddingTop: 10, paddingBottom: 10 }}>
            {joinClassSuccess}
          </div>
        </div>
      )}

      {currentClass && (
        <div style={{ background: "white", borderBottom: "1px solid #e0e0e0", color: "#374151", fontWeight: 700 }}>
          <div className="mgk-container" style={{ paddingTop: 10, paddingBottom: 10 }}>
            Joined class: <span style={{ color: "#4CAF50" }}>{currentClass.name}</span>{" "}
            <span style={{ color: "#999" }}>({currentClass.code})</span>
          </div>
        </div>
      )}

      {/* ECO POINTS COUNTER (subtle, top) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          color: "#2C3E50",
        }}
      >
        <div className="mgk-container" style={{ paddingTop: 7, paddingBottom: 7, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <div style={{ fontWeight: 900, opacity: 0.9 }}>
            🌿{" "}
            <span className="eco-counter-tick" style={{ color: "#1A8F4E", fontVariantNumeric: "tabular-nums" }}>
              {ecoDisplay}
            </span>{" "}
            eco points
          </div>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => {
                setJoinClassError("");
                setJoinClassSuccess("");
                setShowJoinClassModal(true);
              }}
              style={{
                padding: "7px 10px",
                borderRadius: 50,
                border: "2px solid #2ECC71",
                background: "#fff",
                color: "#1A8F4E",
                fontWeight: 900,
                cursor: "pointer",
                boxShadow: "0 4px 0 #1A8F4E",
              }}
            >
              🏫 Join Class
            </button>
            <button
              type="button"
              onClick={() => {
                setEcoError("");
                setEcoMessage("");
                setEcoFile(null);
                setEcoSelectedAction(null);
                setShowEcoUploadModal(true);
              }}
              style={{
                padding: "7px 10px",
                borderRadius: 50,
                border: "2px solid #2ECC71",
                background: "#2ECC71",
                color: "#fff",
                fontWeight: 950,
                cursor: "pointer",
                boxShadow: "0 4px 0 #1A8F4E",
              }}
            >
              📸 Submit Eco Photo
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="mgk-container max-w-[1100px] px-2 pt-2">
        {/* TYPING AREA */}
        <div
          style={{
            position: "relative",
            maxWidth: "100%",
            margin: "0 auto 4px",
            background: "#FFFFFF",
            borderRadius: 14,
            boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
            padding: 11,
            border: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ marginBottom: "7px" }}>
            <div style={{ fontSize: 11, fontWeight: 900, color: "#95A5A6", marginBottom: 4, letterSpacing: "0.08em" }}>
              DRILL TEXT
            </div>
            <div style={{
              fontFamily: "Roboto Mono, monospace",
              fontSize: "13px",
              lineHeight: 1.45,
              color: "#95A5A6",
              background: "#F8F9FA",
              padding: "8px 10px",
              borderRadius: 10,
            }}>
              {currentLesson.drill}
            </div>
          </div>

          <div style={{ marginBottom: "0" }}>
            <div style={{ fontSize: 11, fontWeight: 900, color: "#95A5A6", marginBottom: 6, letterSpacing: "0.08em" }}>
              ECO SENTENCE
            </div>
            <div
              className={`eco-sentence-wrap${wordFlash ? " word-flash" : ""}`}
              style={{
              fontFamily: "Roboto Mono, monospace",
              fontSize: "18px",
              lineHeight: 1.35,
              minHeight: "36px",
              borderRadius: 10,
              transition: "background-color 0.2s ease, box-shadow 0.2s ease",
            }}
            >
              {currentLesson.sentence.split("").map((char, index) => {
                let color = "#95A5A6"; // untyped
                if (index < userInput.length) {
                  color = userInput[index] === char ? "#2ECC71" : "#E67E22"; // correct / wrong (no red)
                }
                const isCurrentPos = index === lessonKeyIndex;
                const style: React.CSSProperties = {
                  color,
                  fontWeight: index < userInput.length && userInput[index] === char ? 800 : 600,
                  display: "inline",
                  position: "relative",
                  borderRadius: 8,
                  padding: "0 2px",
                };
                if (isCurrentPos) {
                  style.background = "#F39C12";
                  style.color = "#1A2F23";
                }
                if (index < userInput.length && userInput[index] !== char) {
                  style.background = "rgba(230, 126, 34, 0.18)";
                }
                return (
                  <span key={index} style={style}>
                    {char}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* TYPING INPUT */}
        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={handleInputChange}
          placeholder="Type here — tap to focus"
          className="lesson-typing-input"
          enterKeyHint="done"
          style={{
            width: "100%",
            height: "44px",
            padding: "0 14px",
            fontSize: "17px",
            fontFamily: "Roboto Mono, monospace",
            border: "2px solid #2ECC71",
            borderRadius: "12px",
            marginBottom: "6px",
            boxSizing: "border-box",
            boxShadow: "0 0 0 0 rgba(46,204,113,0)",
            outline: "none",
            WebkitAppearance: "none" as const,
          }}
          onFocus={(e) => {
            (e.target as HTMLInputElement).style.boxShadow = "0 0 0 4px rgba(46, 204, 113, 0.25)";
          }}
          onBlur={(e) => {
            (e.target as HTMLInputElement).style.boxShadow = "0 0 0 0 rgba(46,204,113,0)";
          }}
          disabled={isComplete}
          autoFocus
        />

        <div
          className="flex flex-col gap-3 md:flex-row md:items-stretch md:gap-4"
          style={{ marginBottom: 0 }}
        >
          <div className="min-w-0 flex-1">
            <EdclubKeyboardSection
              highlightKey={guideHighlightKey}
              shakeKey={shakeKey}
              pressedVKey={pressedVKey}
              themeColor={getThemeColor()}
              fontClassName={nunito.className}
              showInstruction={showKeyboardInstruction}
            />
          </div>
          {petType && petName.trim() ? (
            <div className="hidden shrink-0 md:flex md:w-60 md:flex-col md:items-center md:justify-center">
              <PetWidget
                petType={petType}
                petName={petName}
                health={petHealth}
                pulse={petPulse}
                dance={petDance}
                placement="sidebar"
              />
            </div>
          ) : null}
        </div>

        {/* NAVIGATION BUTTONS */}
        <div style={{
          display: "flex",
          gap: "8px",
          marginBottom: "8px",
          justifyContent: "center",
        }}>
          <button
            onClick={handlePrevLesson}
            disabled={currentLessonId === 1}
            style={{
              padding: "8px 14px",
              background: currentLessonId === 1 ? "#F8F9FA" : "#FFFFFF",
              border: currentLessonId === 1 ? "1px solid rgba(0,0,0,0.08)" : "2px solid #2ECC71",
              color: currentLessonId === 1 ? "#95A5A6" : "#1A8F4E",
              borderRadius: "50px",
              fontSize: "13px",
              fontWeight: 900,
              cursor: currentLessonId === 1 ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
              boxShadow: currentLessonId === 1 ? "none" : "0 4px 0 #1A8F4E",
            }}
          >
            ← Previous Lesson
          </button>
          <button
            onClick={() => setShowLessonMap(true)}
            style={{
              padding: "8px 14px",
              background: "#FFFFFF",
              border: "2px solid #2ECC71",
              color: "#2C3E50",
              borderRadius: "50px",
              fontSize: "13px",
              fontWeight: 900,
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: "0 4px 0 #1A8F4E",
            }}
          >
            📚 See All {lessons.length} Lessons
          </button>
          <button
            onClick={handleNextLesson}
            disabled={currentLessonId === 100}
            style={{
              padding: "8px 14px",
              background: currentLessonId === 100 ? "#F8F9FA" : "#2ECC71",
              border: "none",
              color: currentLessonId === 100 ? "#95A5A6" : "#fff",
              borderRadius: "50px",
              fontSize: "13px",
              fontWeight: 950,
              cursor: currentLessonId === 100 ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
              boxShadow: currentLessonId === 100 ? "none" : "0 4px 0 #1A8F4E",
            }}
          >
            Next Lesson →
          </button>
        </div>

        {/* BOTTOM BAR */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "11px 0",
        }}>
          <div style={{
            fontSize: "13px",
            color: "#4CAF50",
            fontWeight: 600,
            minHeight: "18px",
          }}>
            {messages.map((msg, i) => (
              <div key={i}>{msg}</div>
            ))}
          </div>
          <button
            onClick={handleReset}
            style={{
              padding: "6px 12px",
              background: "white",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "13px",
              cursor: "pointer",
              fontWeight: 600,
              color: "#666",
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* LESSON COMPLETE OVERLAY */}
      {isComplete && (
        <div
          className="lesson-complete-backdrop"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "max(12px, env(safe-area-inset-top)) max(12px, env(safe-area-inset-right)) max(12px, env(safe-area-inset-bottom)) max(12px, env(safe-area-inset-left))",
            overflow: "hidden",
          }}
        >
          <div className="lesson-complete-confetti" aria-hidden>
            {Array.from({ length: 42 }).map((_, i) => (
              <span
                key={i}
                className={`confetti-bit confetti-${i % 3}`}
                style={{
                  left: `${(i * 17 + 7) % 100}%`,
                  animationDelay: `${(i % 12) * 0.08}s`,
                  animationDuration: `${2.2 + (i % 5) * 0.35}s`,
                }}
              />
            ))}
          </div>

          <div
            className="lesson-complete-panel"
            style={{
              position: "relative",
              width: "min(480px, 100%)",
              maxHeight: "min(calc(100vh - 24px), 640px)",
              overflow: "auto",
              borderRadius: 20,
              padding: "16px 18px 14px",
              textAlign: "center",
              background: "linear-gradient(165deg, rgba(255,255,255,0.97) 0%, #f4fbf6 45%, #fffef5 100%)",
              boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
              border: "1px solid rgba(255,255,255,0.65)",
            }}
          >
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 24,
                background:
                  "radial-gradient(circle at 12% 8%, rgba(46,204,113,0.2), transparent 42%), radial-gradient(circle at 88% 12%, rgba(243,156,18,0.22), transparent 40%), radial-gradient(circle at 50% 100%, rgba(46,139,87,0.12), transparent 55%)",
                pointerEvents: "none",
              }}
            />

            <h2
              style={{
                position: "relative",
                fontSize: "clamp(22px, 4.5vw, 30px)",
                fontWeight: 800,
                color: "#14532d",
                margin: "0 0 4px",
              }}
            >
              Lesson complete!
            </h2>
            <div style={{ position: "relative", fontSize: 14, fontWeight: 800, color: "#3d5c4a", marginBottom: 12 }}>
              You helped the planet with every keystroke.
            </div>

            {/* Stars — stagger in */}
            <div
              style={{
                position: "relative",
                display: "flex",
                justifyContent: "center",
                gap: 8,
                marginBottom: 12,
                minHeight: 44,
                alignItems: "center",
              }}
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="complete-star"
                  style={{
                    fontSize: 40,
                    lineHeight: 1,
                    color: i < stars ? "#F1C40F" : "rgba(0,0,0,0.12)",
                    animationDelay: `${0.12 + i * 0.16}s`,
                    textShadow: i < stars ? "0 4px 0 rgba(180,130,0,0.35)" : "none",
                  }}
                >
                  ★
                </span>
              ))}
            </div>

            {/* Stats */}
            <div
              className="lesson-complete-stats"
              style={{
                position: "relative",
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: 8,
                marginBottom: 12,
              }}
            >
              {[
                { label: "WPM", value: stats.wpm },
                { label: "Accuracy", value: `${stats.accuracy}%` },
                { label: "Eco points", value: ecoPointsEarnedThisLesson, sub: "earned" },
              ].map((card) => (
                <div
                  key={card.label}
                  style={{
                    background: "rgba(255,255,255,0.92)",
                    border: "1px solid rgba(46,204,113,0.28)",
                    borderRadius: 14,
                    padding: "10px 8px",
                    boxShadow: "0 8px 20px rgba(26,47,35,0.08)",
                  }}
                >
                  <div style={{ fontSize: 19, fontWeight: 900, color: "#1A8F4E", fontVariantNumeric: "tabular-nums" }}>
                    {card.value}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 900, color: "#6b7c72", marginTop: 3, letterSpacing: "0.04em" }}>
                    {card.label}
                    {card.sub ? (
                      <span style={{ display: "block", fontSize: 9, opacity: 0.85, fontWeight: 800 }}>{card.sub}</span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>

            {/* Eco fact — slide from bottom */}
            {lessonFact && (
              <div
                className="lesson-complete-fact"
                style={{
                  position: "relative",
                  background: "linear-gradient(135deg,#E8F5E9 0%, #FFFDE7 100%)",
                  border: "1px solid rgba(76,175,80,0.4)",
                  padding: "10px 12px",
                  borderRadius: 14,
                  marginBottom: 12,
                  textAlign: "left",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ fontSize: 26, lineHeight: 1 }}>{lessonFact.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 950, color: "#1b4332", marginBottom: 4, fontSize: 12 }}>Eco fact</div>
                    <div style={{ fontWeight: 800, color: "#14532d", fontSize: 14, lineHeight: 1.35 }}>{lessonFact.fact}</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8, alignItems: "center" }}>
                      <span
                        style={{
                          background: "#fff",
                          border: "1px solid rgba(0,0,0,0.06)",
                          borderRadius: 999,
                          padding: "4px 10px",
                          fontSize: 11,
                          fontWeight: 900,
                          color: "#2e7d32",
                        }}
                      >
                        {lessonFact.category}
                      </span>
                      <span style={{ fontSize: 11, color: "#6b7280", fontWeight: 800 }}>Source: {lessonFact.source}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 8, alignItems: "stretch" }}>
              <button
                type="button"
                onClick={handleNextLesson}
                disabled={currentLessonId === 100}
                style={{
                  height: 48,
                  borderRadius: 999,
                  border: "none",
                  background: currentLessonId === 100 ? "#bfc9c4" : "linear-gradient(180deg,#2ECC71,#1A8F4E)",
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: 900,
                  cursor: currentLessonId === 100 ? "not-allowed" : "pointer",
                  boxShadow: currentLessonId === 100 ? "none" : "0 6px 0 #0f3d24, 0 14px 28px rgba(26,143,78,0.35)",
                }}
              >
                {currentLessonId === 100 ? "🏆 You've finished all lessons!" : "Next Lesson →"}
              </button>
              <button
                type="button"
                onClick={handleReset}
                style={{
                  height: 40,
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.95)",
                  border: "2px solid rgba(26,47,35,0.18)",
                  color: "#2d4a3e",
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LESSON MAP MODAL */}
      {showLessonMap && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1002,
        }}>
          <div style={{
            background: "white",
            padding: "40px",
            borderRadius: "16px",
            maxWidth: "900px",
            maxHeight: "90vh",
            overflowY: "auto",
            boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
            animation: "slideUp 0.4s ease",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{
                fontSize: "28px",
                fontWeight: 800,
                color: "#4CAF50",
                margin: 0,
              }}>
                📚 All 100 Lessons
              </h2>
              <button
                onClick={() => setShowLessonMap(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#999",
                }}
              >
                ✕
              </button>
            </div>

            {/* PHASES */}
            {phases.map((phase) => {
              const phraseLessons = lessons.filter(l => l.phase === phase.id);
              return (
                <div key={phase.id} style={{ marginBottom: "32px" }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "16px",
                    paddingBottom: "12px",
                    borderBottom: `2px solid ${phase.color}`,
                  }}>
                    <div style={{ fontSize: "32px" }}>{phase.icon}</div>
                    <div>
                      <div style={{ fontSize: "18px", fontWeight: 700, color: phase.color }}>
                        {phase.name}
                      </div>
                      <div style={{ fontSize: "13px", color: "#666" }}>
                        {phase.description}
                      </div>
                    </div>
                  </div>

                  {/* LESSONS GRID */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                    gap: "12px",
                  }}>
                    {phraseLessons.map((lesson) => (
                      <button
                        key={lesson.id}
                        onClick={() => handleSelectLesson(lesson.id)}
                        style={{
                          padding: "12px 16px",
                          background: currentLessonId === lesson.id ? phase.color : "white",
                          border: currentLessonId === lesson.id ? "none" : `1px solid #ddd`,
                          borderRadius: "8px",
                          textAlign: "left",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          color: currentLessonId === lesson.id ? "white" : "#333",
                        }}
                        onMouseOver={(e) => {
                          const target = e.target as HTMLButtonElement;
                          if (currentLessonId !== lesson.id) {
                            target.style.background = "#f5f5f5";
                            target.style.borderColor = phase.color;
                          }
                        }}
                        onMouseOut={(e) => {
                          const target = e.target as HTMLButtonElement;
                          if (currentLessonId !== lesson.id) {
                            target.style.background = "white";
                            target.style.borderColor = "#ddd";
                          }
                        }}
                      >
                        <div style={{ fontSize: "13px", fontWeight: 700, marginBottom: "4px" }}>
                          Lesson {lesson.id}
                        </div>
                        <div style={{ fontSize: "12px", opacity: 0.8, lineHeight: 1.3 }}>
                          {lesson.title}
                        </div>
                        {lesson.targetWPM && (
                          <div style={{ fontSize: "11px", opacity: 0.7, marginTop: "4px" }}>
                            Goal: {lesson.targetWPM} WPM
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}

            <button
              onClick={() => setShowLessonMap(false)}
              style={{
                width: "100%",
                padding: "14px",
                background: "#4CAF50",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: 700,
                color: "white",
                cursor: "pointer",
                transition: "all 0.2s ease",
                marginTop: "24px",
              }}
            >
              Got it! Let's Type! 🌿
            </button>
          </div>
        </div>
      )}

      {/* WELCOME MODAL */}
      {showWelcomeModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 35, 24, 0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1001,
            padding: 18,
          }}
        >
          <div
            className="welcome-modal-card"
            style={{
              width: "min(480px, 100%)",
              background: "#fff",
              borderRadius: 22,
              boxShadow: "0 24px 70px rgba(0,0,0,0.28)",
              border: "1px solid rgba(0,0,0,0.06)",
              overflow: "hidden",
              textAlign: "center",
            }}
          >
            <div
              className="welcome-modal-hero"
              style={{
                height: 120,
                background:
                  "linear-gradient(180deg, rgba(129,199,132,0.35) 0%, rgba(46,125,50,0.2) 40%, rgba(255,249,230,0.9) 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                fontSize: 40,
                borderBottom: "1px solid rgba(0,0,0,0.06)",
              }}
              aria-hidden
            >
              <span>🌳</span>
              <span>🌿</span>
              <span>🦋</span>
              <span>☀️</span>
            </div>

            <div style={{ padding: "26px 24px 28px" }}>
              <h2
                style={{
                  fontSize: "clamp(22px, 4.5vw, 28px)",
                  fontWeight: 900,
                  color: "#14532d",
                  margin: "0 0 20px",
                }}
              >
                Welcome! What&apos;s your name? 🌿
              </h2>

              <input
                type="text"
                value={welcomeData.name}
                onChange={(e) => setWelcomeData({ ...welcomeData, name: e.target.value })}
                placeholder="Your name"
                autoFocus
                style={{
                  width: "100%",
                  padding: "16px 18px",
                  fontSize: 20,
                  fontWeight: 700,
                  border: "2px solid rgba(46,204,113,0.45)",
                  borderRadius: 16,
                  boxSizing: "border-box",
                  marginBottom: 22,
                  outline: "none",
                }}
              />

              <div
                style={{
                  fontSize: 13,
                  fontWeight: 900,
                  color: "#5a6b62",
                  marginBottom: 10,
                  textAlign: "left",
                }}
              >
                I am a…
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 22 }}>
                <button
                  type="button"
                  onClick={() => setWelcomeData({ ...welcomeData, gender: "boy" })}
                  style={{
                    padding: "18px 12px",
                    borderRadius: 18,
                    border: welcomeData.gender === "boy" ? "3px solid #2563eb" : "2px solid #e5e7eb",
                    background: welcomeData.gender === "boy" ? "linear-gradient(180deg,#dbeafe,#eff6ff)" : "#f9fafb",
                    cursor: "pointer",
                    textAlign: "center",
                    transition: "transform 0.15s ease, box-shadow 0.15s ease",
                    boxShadow: welcomeData.gender === "boy" ? "0 8px 0 #1d4ed8" : "none",
                  }}
                >
                  <div style={{ fontSize: 44, lineHeight: 1 }}>👦</div>
                  <div style={{ fontWeight: 950, color: "#1e3a8a", marginTop: 8, fontSize: 16 }}>Boy</div>
                </button>
                <button
                  type="button"
                  onClick={() => setWelcomeData({ ...welcomeData, gender: "girl" })}
                  style={{
                    padding: "18px 12px",
                    borderRadius: 18,
                    border: welcomeData.gender === "girl" ? "3px solid #db2777" : "2px solid #e5e7eb",
                    background: welcomeData.gender === "girl" ? "linear-gradient(180deg,#fce7f3,#fdf2f8)" : "#f9fafb",
                    cursor: "pointer",
                    textAlign: "center",
                    transition: "transform 0.15s ease, box-shadow 0.15s ease",
                    boxShadow: welcomeData.gender === "girl" ? "0 8px 0 #be185d" : "none",
                  }}
                >
                  <div style={{ fontSize: 44, lineHeight: 1 }}>👧</div>
                  <div style={{ fontWeight: 950, color: "#9d174d", marginTop: 8, fontSize: 16 }}>Girl</div>
                </button>
              </div>

              <div
                style={{
                  fontSize: 13,
                  fontWeight: 900,
                  color: "#5a6b62",
                  marginBottom: 10,
                  textAlign: "left",
                }}
              >
                My age
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  overflowX: "auto",
                  paddingBottom: 6,
                  marginBottom: 22,
                  WebkitOverflowScrolling: "touch",
                }}
              >
                {Array.from({ length: 9 }, (_, i) => i + 6).map((age) => {
                  const sel = welcomeData.age === String(age);
                  return (
                    <button
                      key={age}
                      type="button"
                      onClick={() => setWelcomeData({ ...welcomeData, age: String(age) })}
                      style={{
                        flex: "0 0 auto",
                        minWidth: 44,
                        height: 44,
                        borderRadius: 999,
                        border: sel ? "2px solid #16a34a" : "2px solid #e5e7eb",
                        background: sel ? "#dcfce7" : "#fff",
                        fontWeight: 950,
                        fontSize: 16,
                        color: sel ? "#14532d" : "#64748b",
                        cursor: "pointer",
                      }}
                    >
                      {age}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleWelcomeSubmit}
                disabled={!welcomeData.name?.trim() || !welcomeData.gender}
                style={{
                  width: "100%",
                  height: 54,
                  borderRadius: 999,
                  border: "none",
                  background:
                    welcomeData.name?.trim() && welcomeData.gender
                      ? "linear-gradient(180deg,#2ECC71,#1A8F4E)"
                      : "#d1d5db",
                  color: "#fff",
                  fontSize: 18,
                  fontWeight: 950,
                  cursor: welcomeData.name?.trim() && welcomeData.gender ? "pointer" : "not-allowed",
                  boxShadow:
                    welcomeData.name?.trim() && welcomeData.gender ? "0 6px 0 #0f3d24, 0 12px 24px rgba(26,143,78,0.3)" : "none",
                }}
              >
                Let&apos;s Start! 🚀
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TYPING RULES MODAL */}
      {showTypingRulesModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1001,
        }}>
          <div style={{
            background: "white",
            padding: "40px",
            borderRadius: "16px",
            maxWidth: "600px",
            maxHeight: "80vh",
            overflowY: "auto",
            boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
            animation: "slideUp 0.4s ease",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{
                fontSize: "28px",
                fontWeight: 800,
                color: "#4CAF50",
                margin: 0,
              }}>
                Typing Rules 📏
              </h2>
              <button
                onClick={() => setShowTypingRulesModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#999",
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: "24px" }}>
              {TYPING_RULES.map((rule, index) => (
                <div key={index} style={{
                  background: "#F5F5F5",
                  padding: "16px",
                  borderRadius: "8px",
                  marginBottom: "12px",
                  borderLeft: `4px solid #4CAF50`,
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                    <div style={{ fontSize: "24px", minWidth: "32px" }}>{rule.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: "16px",
                        fontWeight: 700,
                        color: "#4CAF50",
                        marginBottom: "4px",
                      }}>
                        Rule {index + 1} - {rule.title}
                      </div>
                      <div style={{
                        fontSize: "13px",
                        color: "#666",
                        lineHeight: 1.5,
                      }}>
                        {rule.description}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowTypingRulesModal(false)}
              style={{
                width: "100%",
                padding: "14px",
                background: "#4CAF50",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: 700,
                color: "white",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              Got it! Let's Type! 🌿
            </button>
          </div>
        </div>
      )}

      {/* ECO PHOTO UPLOAD MODAL */}
      {showEcoUploadModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1003,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "28px",
              borderRadius: "16px",
              width: "min(560px, 92vw)",
              boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
              animation: "slideUp 0.25s ease",
            }}
          >
            {/* Pencil texture filter defs */}
            <svg
              width="0"
              height="0"
              style={{ position: "absolute" }}
              aria-hidden="true"
              focusable="false"
            >
              <defs>
                <filter id="kidsPencilFilterLesson" x="-10%" y="-10%" width="120%" height="120%">
                  <feTurbulence
                    type="fractalNoise"
                    baseFrequency="0.9"
                    numOctaves="3"
                    seed="7"
                    result="noise"
                  />
                  <feDisplacementMap
                    in="SourceGraphic"
                    in2="noise"
                    scale="4"
                    xChannelSelector="R"
                    yChannelSelector="G"
                    result="displaced"
                  />

                  {/* Edge sketch */}
                  <feColorMatrix in="displaced" type="luminanceToAlpha" result="luma" />
                  <feConvolveMatrix
                    in="luma"
                    order="3"
                    kernelMatrix="-1 -1 -1 -1 8 -1 -1 -1 -1"
                    result="edges"
                  />
                  <feComponentTransfer in="edges" result="edgesSoft">
                    <feFuncA type="gamma" amplitude="0.65" exponent="1.2" offset="0" />
                  </feComponentTransfer>
                  <feBlend in="displaced" in2="edgesSoft" mode="multiply" result="withEdges" />

                  {/* Paper grain */}
                  <feTurbulence
                    type="fractalNoise"
                    baseFrequency="0.15"
                    numOctaves="2"
                    seed="3"
                    result="paper"
                  />
                  <feColorMatrix
                    in="paper"
                    type="matrix"
                    values="
                      0 0 0 0 0.7
                      0 0 0 0 0.7
                      0 0 0 0 0.7
                      0 0 0 0.15 0"
                    result="paperAlpha"
                  />
                  <feBlend in="withEdges" in2="paperAlpha" mode="soft-light" />
                </filter>
              </defs>
            </svg>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h2
                style={{
                  fontSize: "22px",
                  fontWeight: 800,
                  color: "#2c3e50",
                  margin: 0,
                }}
              >
                Submit an eco action photo 🌿
              </h2>
              <button
                onClick={() => setShowEcoUploadModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "22px",
                  cursor: "pointer",
                  color: "#999",
                }}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {ecoError && (
              <div
                style={{
                  background: "#ffebee",
                  border: "1px solid #ef5350",
                  color: "#c62828",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  marginBottom: "12px",
                  fontSize: "13px",
                }}
              >
                {ecoError}
              </div>
            )}

            {ecoMessage && (
              <div
                style={{
                  background: "#e8f5e9",
                  border: "1px solid #4caf50",
                  color: "#2e7d32",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  marginBottom: "12px",
                  fontSize: "13px",
                }}
              >
                {ecoMessage}
              </div>
            )}

            <div style={{ marginBottom: "14px" }}>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#2c3e50",
                  marginBottom: "8px",
                }}
              >
                Choose an eco action
              </div>
              <div style={{ display: "grid", gap: 10 }}>
                {ECO_ACTIONS.map((action) => {
                  const selected = ecoSelectedAction === action.type;
                  return (
                    <button
                      key={action.type}
                      type="button"
                      onClick={() => setEcoSelectedAction(action.type)}
                      style={{
                        textAlign: "left",
                        padding: "12px 14px",
                        borderRadius: "12px",
                        border: selected ? "2px solid #4CAF50" : "1px solid #e0e0e0",
                        background: selected ? "#E8F5E9" : "white",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ fontWeight: 700, color: "#2c3e50" }}>
                        {action.label}
                      </span>
                      <span style={{ fontSize: "12px", color: "#4CAF50", fontWeight: 800 }}>
                        +{action.points} eco points
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#2c3e50",
                  marginBottom: "8px",
                }}
              >
                Upload a photo
              </div>
              <input
                type="file"
                accept="image/*"
                disabled={ecoSubmitting}
                onChange={(e) => setEcoFile(e.target.files?.[0] || null)}
              />
              {ecoFile && (
                <div style={{ marginTop: 8, fontSize: "12px", color: "#666" }}>
                  Selected: <strong>{ecoFile.name}</strong>
                </div>
              )}
              {ecoPreviewUrl && (
                <div
                  style={{
                    marginTop: 12,
                    borderRadius: 14,
                    overflow: "hidden",
                    border: "1px solid #e0e0e0",
                    background: "#fff",
                  }}
                >
                  <img
                    src={ecoPreviewUrl}
                    alt="Eco photo preview"
                    style={{
                      width: "100%",
                      height: 220,
                      objectFit: "cover",
                      display: "block",
                      filter:
                        "url(#kidsPencilFilterLesson) contrast(140%) saturate(150%) brightness(110%)",
                    }}
                  />
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleSubmitEcoPhoto}
              disabled={ecoSubmitting}
              style={{
                width: "100%",
                padding: "12px 14px",
                background: ecoSubmitting ? "#bbb" : "#4CAF50",
                border: "none",
                borderRadius: "12px",
                color: "white",
                fontSize: "15px",
                fontWeight: 800,
                cursor: ecoSubmitting ? "not-allowed" : "pointer",
              }}
            >
              {ecoSubmitting ? "Submitting..." : "Submit photo"}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes blink {
          0%, 49% { border-bottom: 2px solid #2196F3; }
          50%, 100% { border-bottom: 2px solid transparent; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        @keyframes shakeWrong {
          0%, 100% { transform: translateX(0); }
          33% { transform: translateX(-6px); }
          66% { transform: translateX(6px); }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.5);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        /* Virtual Pet animations */
        .pet { display: inline-block; transform-origin: 50% 80%; }
        .pet-happy { animation: petBounce 1.15s ease-in-out infinite; }
        .pet-neutral { animation: petIdle 2.2s ease-in-out infinite; }
        .pet-sad { animation: petDroop 1.6s ease-in-out infinite; opacity: 0.9; }
        .pet-pulse { animation: petPulse 0.3s ease-out !important; }
        .pet-dance { animation: petDance 0.7s ease-in-out infinite; }

        @keyframes petBounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-6px) scale(1.04); }
        }
        @keyframes petIdle {
          0%, 100% { transform: translateY(0) rotate(-1deg); }
          50% { transform: translateY(-2px) rotate(1deg); }
        }
        @keyframes petDroop {
          0%, 100% { transform: translateY(3px) rotate(-4deg) scale(0.98); }
          50% { transform: translateY(5px) rotate(-6deg) scale(0.97); }
        }
        @keyframes petPulse {
          0% { transform: translateY(0) scale(1); }
          45% { transform: translateY(-8px) scale(1.05); }
          100% { transform: translateY(0) scale(1); }
        }
        @keyframes petDance {
          0% { transform: rotate(0deg) translateY(0); }
          25% { transform: rotate(10deg) translateY(-4px); }
          50% { transform: rotate(-10deg) translateY(-4px); }
          75% { transform: rotate(10deg) translateY(-2px); }
          100% { transform: rotate(0deg) translateY(0); }
        }

        /* Eco fact animations */
        @keyframes factSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fact-popup { animation: factPop 320ms ease both; }
        @keyframes factPop {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Lesson complete overlay — nature + confetti */
        .lesson-complete-backdrop {
          background:
            radial-gradient(ellipse 120% 80% at 50% 0%, rgba(180, 230, 180, 0.5), transparent 55%),
            linear-gradient(180deg, #1a3d28 0%, #2d6a4f 35%, #52b788 70%, #b7e4c7 100%);
        }
        .lesson-complete-confetti {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }
        .confetti-bit {
          position: absolute;
          top: -12px;
          width: 9px;
          height: 12px;
          border-radius: 2px;
          opacity: 0.92;
          animation-name: confettiFall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        .confetti-0 { background: linear-gradient(180deg, #facc15, #22c55e); }
        .confetti-1 { background: linear-gradient(180deg, #4ade80, #fbbf24); }
        .confetti-2 { background: linear-gradient(180deg, #86efac, #eab308); }
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0.65; }
        }
        .lesson-complete-panel {
          animation: lessonCompleteZoom 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes lessonCompleteZoom {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
        .complete-star {
          opacity: 0;
          animation: starPop 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes starPop {
          from { opacity: 0; transform: scale(0.2) translateY(16px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .lesson-complete-fact {
          animation: factFromBottom 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes factFromBottom {
          from { opacity: 0; transform: translateY(28px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 420px) {
          .lesson-complete-stats {
            grid-template-columns: 1fr !important;
          }
        }

        /* Welcome modal */
        .welcome-modal-card {
          animation: welcomeSlide 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes welcomeSlide {
          from { opacity: 0; transform: translateY(22px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Mobile typing bar + spacing */
        .lesson-main-pad {
          padding-bottom: calc(24px + env(safe-area-inset-bottom, 0px));
        }
        @media (max-width: 767px) {
          .lesson-main-pad {
            padding-bottom: calc(168px + env(safe-area-inset-bottom, 0px));
          }
          .lesson-typing-input {
            position: fixed !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 38px !important;
            z-index: 45 !important;
            max-width: 100vw !important;
            margin: 0 !important;
            border-radius: 18px 18px 0 0 !important;
            margin-bottom: 0 !important;
            box-shadow: 0 -8px 28px rgba(0, 0, 0, 0.14) !important;
            border-bottom: none !important;
          }
          .nav-pet-emoji {
            width: 40px !important;
            height: 40px !important;
            font-size: 22px !important;
          }
        }
        @media (min-width: 768px) {
          .nav-pet-emoji {
            width: 50px;
            height: 50px;
            font-size: 28px;
          }
        }

        .pet-health-fill {
          transition: width 0.45s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .lesson-strip-progress-fill {
          transition: width 0.45s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .eco-counter-tick {
          transition: transform 0.2s ease, color 0.2s ease;
          display: inline-block;
        }
        .word-flash {
          background-color: rgba(46, 204, 113, 0.22) !important;
          box-shadow: inset 0 0 0 2px rgba(46, 204, 113, 0.35);
        }

        /* Onboarding visuals */
        .onb-leaf {
          position: absolute;
          top: -30px;
          width: 14px;
          height: 14px;
          border-radius: 0 50% 0 50%;
          background: rgba(255,235,59,0.9);
          opacity: 0.7;
          animation: onbLeafFall linear infinite;
          pointer-events: none;
          z-index: 0;
        }
        @keyframes onbLeafFall {
          0% { transform: translateY(-20px) rotate(0deg); }
          100% { transform: translateY(110vh) rotate(720deg) translateX(60px); }
        }
        .onb-trees {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 180px;
          background: linear-gradient(180deg, transparent 0%, rgba(27,77,48,0.85) 60%, rgba(27,77,48,1) 100%);
          pointer-events: none;
          z-index: 0;
        }
        .onb-heroTrees {
          height: 150px;
          border-radius: 18px;
          background:
            radial-gradient(circle at 20% 85%, rgba(255,255,255,0.12) 0%, transparent 48%),
            radial-gradient(circle at 60% 85%, rgba(255,255,255,0.10) 0%, transparent 50%),
            radial-gradient(circle at 85% 82%, rgba(255,255,255,0.09) 0%, transparent 45%),
            linear-gradient(180deg, rgba(76,175,80,0.18) 0%, rgba(33,150,243,0.08) 100%);
          border: 1px solid rgba(0,0,0,0.06);
          position: relative;
          overflow: hidden;
        }
        .onb-heroTrees::after {
          content: "🌳   🌲    🌳   🌲   🌳";
          position: absolute;
          bottom: 10px;
          left: 10px;
          font-size: 26px;
          opacity: 0.95;
          animation: onbTreeSway 2.8s ease-in-out infinite;
          transform-origin: left bottom;
        }
        @keyframes onbTreeSway {
          0%, 100% { transform: rotate(-1deg); }
          50% { transform: rotate(1deg); }
        }
        .onb-card {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #fff;
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 16px;
          padding: 14px 16px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
          animation: onbCardIn 480ms ease both;
        }
        @keyframes onbCardIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .onb-dot {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: #4CAF50;
          box-shadow: 0 0 0 3px rgba(76,175,80,0.18);
        }
        .onb-dot-off {
          background: rgba(0,0,0,0.18);
          box-shadow: none;
        }
      `}</style>

      <MilestoneCelebration streakUpdate={streakUpdate} onClose={() => setStreakUpdate(null)} />
      <RankUpCelebration xpAwarded={xpAwarded} onClose={() => setXpAwarded(null)} />

      {/* BOTTOM PROGRESS BAR */}
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          height: 38,
          background: "#FFFFFF",
          borderTop: "1px solid rgba(0,0,0,0.08)",
          zIndex: 40,
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          gap: 12,
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 900, color: "#2C3E50", whiteSpace: "nowrap" }}>
          Lesson {currentLessonId} of 100
        </div>
        <div style={{ flex: 1, height: 6, borderRadius: 999, background: "#F8F9FA", overflow: "hidden" }}>
          <div
            style={{
              width: `${lessonProgress}%`,
              height: "100%",
              background: "linear-gradient(90deg,#2ECC71,#1A8F4E)",
              transition: "width 0.35s ease",
            }}
          />
        </div>
        <div
          style={{
            transform: `translateX(${lessonProgress - 50}%)`,
            transition: "transform 0.35s ease",
            fontSize: 16,
          }}
          aria-hidden
        >
          🌿
        </div>
      </div>
    </div>
  );
}
