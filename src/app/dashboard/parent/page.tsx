"use client";

import React, { useEffect, useMemo, startTransition, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  BookOpen,
  CheckCircle,
  Clock,
  FileText,
  Flame,
  Globe,
  Home,
  Leaf,
  Sprout,
  LogOut,
  PawPrint,
  ScrollText,
  Settings,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
  Users,
  Zap,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { awardXp, getProgress, XP_SOURCES, type RangerRank } from "@/lib/rangerHelpers";
import { RankBadge, rankProgressFillClassName } from "@/components/RankBadge";
import { ecoFacts } from "@/data/ecoFacts";
import { getTodayDate } from "@/lib/streakHelpers";
import { HabitQuestsSection } from "@/components/parent/HabitQuestsSection";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const LeafIcon = () => (
  <svg
    width={20}
    height={20}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
  </svg>
);

const selectClassName =
  "flex h-8 w-full rounded-md border border-input bg-background px-2.5 py-1 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50";

const SECTION_CARD: React.CSSProperties = {
  background: "#FFFFFF",
  borderRadius: "20px",
  padding: "28px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
  border: "1px solid #E5E7EB",
  marginBottom: "24px",
};

const SECTION_H2: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: 700,
  color: "#1B4332",
  marginBottom: "20px",
};

const INNER_PROGRESS_CARD: React.CSSProperties = {
  background: "#F9FAFB",
  borderRadius: "12px",
  padding: "20px",
  border: "1px solid #E5E7EB",
};

const FORM_LABEL: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: 700,
  color: "#1B4332",
  marginBottom: "8px",
  display: "block",
};

const FORM_CONTROL: React.CSSProperties = {
  width: "100%",
  padding: "12px 16px",
  borderRadius: "12px",
  border: "2px solid #E5E7EB",
  fontSize: "14px",
  background: "#FFFFFF",
  transition: "border 0.2s",
  outline: "none",
  boxSizing: "border-box",
};

const PRIMARY_CTA: React.CSSProperties = {
  background: "linear-gradient(135deg, #52B788 0%, #40916C 100%)",
  color: "#FFFFFF",
  padding: "14px 24px",
  borderRadius: "12px",
  fontSize: "15px",
  fontWeight: 700,
  border: "none",
  cursor: "pointer",
  width: "100%",
  marginTop: "16px",
  boxShadow: "0 4px 12px rgba(82, 183, 136, 0.25)",
};

const SIDEBAR_LINKS = [
  { href: "#parent-overview", label: "Overview", Icon: Home },
  { href: "#parent-children", label: "My Children", Icon: Users },
  { href: "#parent-progress", label: "Progress", Icon: BarChart3 },
  { href: "#parent-eco", label: "Eco Actions", Icon: Leaf },
  { href: "#parent-lessons", label: "Custom Lessons", Icon: BookOpen },
  { href: "#parent-quests", label: "Habit Quests", Icon: ScrollText },
  { href: "#parent-summary", label: "Reports", Icon: FileText },
  { href: "#parent-billing", label: "Settings", Icon: Settings },
] as const;

interface Child {
  id: string;
  name: string;
  username: string;
  age: number;
  gender: "boy" | "girl";
  avatar: string;
  /** Linked student auth/profile UUID when username matches profiles.email */
  studentProfileId: string | null;
  lessonsCompleted: number;
  avgWpm: number;
  accuracy: number;
  ecoPhotos: number;
  currentStreak: number;
  longestStreak: number;
  lastStreakDate: string | null;
  streakFreezes: number;
  ranger_xp: number;
  ranger_rank: RangerRank;
  badges: string[];
  wpmData: number[];
  nextMilestone: string;
  ecoActions: { type: string; date: string; approved: boolean }[];
}

interface CustomLesson {
  id: string;
  name: string;
  text: string;
  difficulty: string;
  assignedTo: string;
  createdAt: string;
}

interface PendingPhoto {
  id: string;
  studentId: string;
  photoUrl: string;
  actionType: string;
  dateSubmitted: string;
  pointsAwarded: number;
}

type ChildRow = {
  id: string;
  full_name: string | null;
  age: number | null;
  gender: "boy" | "girl" | null;
  username: string | null;
};

type ParentNotifRow = {
  id: string;
  message?: string | null;
  created_at?: string | null;
};

type PetProfileRow = {
  id: string;
  email: string;
  pet_type?: string | null;
  pet_name?: string | null;
  pet_health?: number | null;
  current_streak?: number | null;
  longest_streak?: number | null;
  last_streak_date?: string | null;
  streak_freezes?: number | null;
  ranger_xp?: number | null;
  ranger_rank?: string | null;
};

const RANK_IDS = new Set<string>(["cadet", "scout", "ranger", "captain", "hero"]);

function coerceRangerRank(value: unknown): RangerRank {
  return typeof value === "string" && RANK_IDS.has(value) ? (value as RangerRank) : "cadet";
}

function toChildDashboard(row: ChildRow): Child {
  const gender = row.gender ?? "boy";
  const name = row.full_name?.trim() || "Child";
  const username = row.username?.trim() || "";
  const age = row.age ?? 0;
  return {
    id: row.id,
    name,
    username,
    age,
    gender,
    avatar: gender === "girl" ? "girl" : "boy",
    studentProfileId: null,
    lessonsCompleted: 0,
    avgWpm: 0,
    accuracy: 0,
    ecoPhotos: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastStreakDate: null,
    streakFreezes: 0,
    ranger_xp: 0,
    ranger_rank: "cadet",
    badges: [],
    wpmData: [],
    nextMilestone: "Complete lessons to unlock badges",
    ecoActions: [],
  };
}

function ParentOverviewStreakCard({ child }: { child: Child }) {
  const streak = child.currentStreak;
  const longest = child.longestStreak;
  const today = getTodayDate();
  const streakAtRisk =
    streak > 0 && child.lastStreakDate !== null && child.lastStreakDate < today;

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #FB923C 0%, #EA580C 45%, #DC2626 100%)",
        padding: "24px",
        borderRadius: "16px",
        color: "#FFFFFF",
        display: "flex",
        alignItems: "center",
        gap: "20px",
      }}
    >
      <div style={{ fontSize: "48px", fontWeight: 700, lineHeight: 1, minWidth: "64px" }}>{streak}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
          <p style={{ fontSize: "14px", fontWeight: 700, opacity: 0.95 }}>Daily Streak</p>
          <Link
            href="/ranger"
            className="hidden items-center gap-1 text-xs font-bold text-white/95 underline-offset-2 hover:underline md:inline-flex"
          >
            <Shield className="h-3.5 w-3.5" aria-hidden />
            Ranger
          </Link>
        </div>
        <p style={{ fontSize: "16px", fontWeight: 600, marginTop: "8px" }}>
          {streak > 0 ? `${streak} day streak` : "Start a streak today"}
        </p>
        {streakAtRisk ? (
          <p
            style={{
              fontSize: "12px",
              fontWeight: 600,
              marginTop: "8px",
              color: "#FEF3C7",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden />
            Streak ends today!
          </p>
        ) : null}
        <p style={{ fontSize: "12px", opacity: 0.88, marginTop: "8px" }}>Longest: {longest} days</p>
      </div>
      <Flame className="hidden h-10 w-10 shrink-0 opacity-90 sm:block" strokeWidth={2.25} aria-hidden />
    </div>
  );
}

function ParentOverviewRangerCard({ child }: { child: Child }) {
  const xp = child.ranger_xp;
  const prog = getProgress(xp);
  const fill = rankProgressFillClassName(prog.currentRank.id);
  const isMax = prog.nextRank === null;

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #1B4332 0%, #2D6A4F 55%, #52B788 100%)",
        padding: "24px",
        borderRadius: "16px",
        color: "#FFFFFF",
        display: "flex",
        alignItems: "center",
        gap: "20px",
      }}
    >
      <div style={{ fontSize: "36px", fontWeight: 700, lineHeight: 1, minWidth: "56px" }}>
        {xp.toLocaleString()}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
          <p style={{ fontSize: "14px", fontWeight: 700, opacity: 0.95 }}>Planet Ranger</p>
          <Link
            href="/ranger"
            className="hidden items-center gap-1 text-xs font-bold text-white/95 underline-offset-2 hover:underline md:inline-flex"
          >
            <Shield className="h-3.5 w-3.5" aria-hidden />
            Details
          </Link>
        </div>
        <div style={{ marginTop: "10px" }}>
          <RankBadge xp={xp} rank={child.ranger_rank} variant="full" />
        </div>
        {isMax ? (
          <p
            style={{
              marginTop: "10px",
              fontSize: "14px",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Sparkles className="h-4 w-4 shrink-0" aria-hidden />
            Maxed out!
          </p>
        ) : (
          <>
            <div
              style={{
                marginTop: "12px",
                height: "6px",
                width: "100%",
                borderRadius: "6px",
                background: "rgba(255,255,255,0.22)",
              }}
            >
              <div
                className={cn("h-full rounded-md transition-all", fill)}
                style={{ width: `${prog.progressPercent}%` }}
              />
            </div>
            <p style={{ fontSize: "12px", opacity: 0.92, marginTop: "6px" }}>
              {prog.xpToNext.toLocaleString()} XP to {prog.nextRank?.label}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function ParentDashboard() {
  const { showToast } = useToast();
  const [hash, setHash] = useState("");
  const [parentName, setParentName] = useState("");
  const [children, setChildren] = useState<Child[]>([]);
  const [childrenLoading, setChildrenLoading] = useState(true);
  const [childrenError, setChildrenError] = useState("");
  const [petWarnings, setPetWarnings] = useState<
    Array<{ childName: string; petName: string; petHealth: number }>
  >([]);
  const [certificateNotifs, setCertificateNotifs] = useState<
    Array<{ id: string; message: string; createdAt: string }>
  >([]);
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [addChildLoading, setAddChildLoading] = useState(false);
  const [addChildError, setAddChildError] = useState("");
  const [childForm, setChildForm] = useState({
    name: "",
    username: "",
    age: "8",
    gender: "boy" as "boy" | "girl",
  });

  const [lessonText, setLessonText] = useState("");
  const [lessonName, setLessonName] = useState("");
  const [lessonDifficulty, setLessonDifficulty] = useState("Beginner");
  const [customLessons, setCustomLessons] = useState<CustomLesson[]>([]);
  const [promoCode, setPromoCode] = useState("");
  const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>([]);
  const [ecoError, setEcoError] = useState<string>("");
  const [ecoSuccess, setEcoSuccess] = useState<string>("");
  const [ecoLoading, setEcoLoading] = useState<boolean>(true);
  const [ecoApprovingId, setEcoApprovingId] = useState<string | null>(null);

  const selectedChild = children.find((c) => c.id === selectedChildId) || null;

  const actionLabel = useMemo(() => {
    const map: Record<string, string> = {
      planting_tree: "Planting a tree",
      watering_plants: "Watering plants",
      water_for_birds: "Water on roof for birds",
    };
    return (actionType: string) => map[actionType] || actionType;
  }, []);

  const todaysFact = useMemo(() => {
    if (!ecoFacts || ecoFacts.length === 0) return null;
    const today = new Date().toISOString().slice(0, 10);
    let h = 0;
    const seed = `parent:${today}`;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    const fact = ecoFacts[h % ecoFacts.length];
    return { emoji: fact.emoji, fact: fact.fact, source: fact.source };
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.log("[ParentDashboard] todaysFact", todaysFact);
    }
  }, [todaysFact]);

  useEffect(() => {
    const loadPending = async () => {
      setEcoLoading(true);
      setEcoError("");
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("eco_photos")
          .select("id, student_id, action_type, photo_url, submitted_at, points_awarded, status")
          .eq("status", "pending")
          .order("submitted_at", { ascending: false });

        if (error) throw error;

        setPendingPhotos(
          (data || []).map((row) => ({
            id: row.id as string,
            studentId: row.student_id as string,
            photoUrl: (row.photo_url as string) || "",
            actionType: (row.action_type as string) || "",
            dateSubmitted: row.submitted_at
              ? new Date(row.submitted_at as string).toLocaleString()
              : "",
            pointsAwarded: (row.points_awarded as number) || 0,
          }))
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load pending photos.";
        setEcoError(message);
      } finally {
        setEcoLoading(false);
      }
    };

    startTransition(() => {
      void loadPending();
    });
  }, []);

  const loadChildren = async () => {
    setChildrenLoading(true);
    setChildrenError("");
    try {
      const supabase = createClient();
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!userData.user) {
        setChildren([]);
        setSelectedChildId("");
        setChildrenError("You must be logged in to view your children.");
        return;
      }

      try {
        const { data: notifs, error: notifErr } = await supabase
          .from("parent_notifications")
          .select("id, message, created_at, read_at, kind")
          .eq("parent_id", userData.user.id)
          .eq("kind", "certificate")
          .is("read_at", null)
          .order("created_at", { ascending: false })
          .limit(5);
        if (!notifErr) {
          setCertificateNotifs(
            ((notifs as ParentNotifRow[] | null) ?? []).map((n) => ({
              id: n.id,
              message: n.message || "Your child earned a certificate!",
              createdAt: n.created_at || "",
            }))
          );
        } else {
          setCertificateNotifs([]);
        }
      } catch {
        setCertificateNotifs([]);
      }

      const { data, error } = await supabase
        .from("children")
        .select("id, full_name, age, gender, username")
        .eq("parent_id", userData.user.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      const mapped = (data as ChildRow[] | null)?.map(toChildDashboard) ?? [];

      const usernames = mapped.map((c) => c.username).filter(Boolean);
      let withProfileIds: Child[] = mapped;
      if (usernames.length === 0) {
        setChildren(mapped);
        if (mapped.length > 0) {
          setSelectedChildId((prev) => prev || mapped[0].id);
        } else {
          setSelectedChildId("");
        }
        setPetWarnings([]);
        return;
      }

      const { data: petProfiles, error: petError } = await supabase
        .from("profiles")
        .select(
          "id, email, pet_type, pet_name, pet_health, current_streak, longest_streak, last_streak_date, streak_freezes, ranger_xp, ranger_rank",
        )
        .in("email", usernames as string[]);
      if (petError) {
        setChildren(mapped);
        if (mapped.length > 0) {
          setSelectedChildId((prev) => prev || mapped[0].id);
        } else {
          setSelectedChildId("");
        }
        setPetWarnings([]);
        return;
      }

      const profileRows = (petProfiles as PetProfileRow[] | null) ?? [];
      const profileByEmail = new Map(
        profileRows.map((p) => [String(p.email ?? "").trim().toLowerCase(), p])
      );
      withProfileIds = mapped.map((c) => {
        const key = c.username.trim().toLowerCase();
        const p = profileByEmail.get(key);
        return {
          ...c,
          studentProfileId: p?.id ?? null,
          currentStreak: Number(p?.current_streak ?? 0),
          longestStreak: Number(p?.longest_streak ?? 0),
          lastStreakDate: p?.last_streak_date ?? null,
          streakFreezes: Number(p?.streak_freezes ?? 0),
          ranger_xp: Number(p?.ranger_xp ?? 0),
          ranger_rank: coerceRangerRank(p?.ranger_rank),
        };
      });

      setChildren(withProfileIds);
      if (withProfileIds.length > 0) {
        setSelectedChildId((prev) => prev || withProfileIds[0].id);
      } else {
        setSelectedChildId("");
      }

      const warnings: Array<{ childName: string; petName: string; petHealth: number }> = [];
      for (const c of withProfileIds) {
        if (!c.username) continue;
        const p = profileByEmail.get(c.username.trim().toLowerCase());
        if (!p) continue;
        const health = Number(p.pet_health ?? 100);
        if (Number.isFinite(health) && health < 40) {
          warnings.push({
            childName: c.name,
            petName: p.pet_name ?? "Pet",
            petHealth: health,
          });
        }
      }
      setPetWarnings(warnings);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load children.";
      setChildrenError(message);
      setChildren([]);
      setSelectedChildId("");
    } finally {
      setChildrenLoading(false);
    }
  };

  useEffect(() => {
    startTransition(() => {
      void loadChildren();
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setHash(window.location.hash || "#parent-overview");
    const onHash = () => setHash(window.location.hash || "#parent-overview");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    startTransition(() => {
      void (async () => {
        try {
          const supabase = createClient();
          const { data: userData } = await supabase.auth.getUser();
          if (!userData.user) return;
          const { data } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", userData.user.id)
            .maybeSingle();
          const n = (data as { full_name?: string } | null)?.full_name?.trim();
          setParentName(n || "there");
        } catch {
          setParentName("there");
        }
      })();
    });
  }, []);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  const handleAddChild = async () => {
    setAddChildError("");
    setAddChildLoading(true);
    try {
      const supabase = createClient();
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!userData.user) {
        setAddChildError("You must be logged in to add a child.");
        return;
      }

      const age = Number(childForm.age);
      if (!childForm.name.trim()) {
        setAddChildError("Child name is required.");
        return;
      }
      if (!Number.isFinite(age) || age < 3 || age > 18) {
        setAddChildError("Please enter a valid age.");
        return;
      }
      if (!childForm.username.trim()) {
        setAddChildError("Username is required.");
        return;
      }

      const { error } = await supabase.from("children").insert([
        {
          parent_id: userData.user.id,
          full_name: childForm.name.trim(),
          age,
          gender: childForm.gender,
          username: childForm.username.trim(),
        },
      ]);
      if (error) throw error;

      setShowAddChildModal(false);
      setChildForm({ name: "", username: "", age: "8", gender: "boy" });
      await loadChildren();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to add child.";
      setAddChildError(message);
    } finally {
      setAddChildLoading(false);
    }
  };

  const handleSaveLesson = () => {
    if (lessonName && lessonText) {
      const newLesson: CustomLesson = {
        id: Date.now().toString(),
        name: lessonName,
        text: lessonText,
        difficulty: lessonDifficulty,
        assignedTo: selectedChildId,
        createdAt: new Date().toLocaleDateString(),
      };
      setCustomLessons([...customLessons, newLesson]);
      setLessonName("");
      setLessonText("");
      setLessonDifficulty("Beginner");
    }
  };

  const handleApprovePhoto = async (photo: PendingPhoto) => {
    setEcoError("");
    setEcoSuccess("");
    setEcoApprovingId(photo.id);
    try {
      const supabase = createClient();

      const { error: updatePhotoError } = await supabase
        .from("eco_photos")
        .update({
          status: "approved",
          reviewed_at: new Date().toISOString(),
          points_awarded: photo.pointsAwarded,
        })
        .eq("id", photo.id);

      if (updatePhotoError) throw updatePhotoError;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("eco_points")
        .eq("id", photo.studentId)
        .single();

      if (profileError) throw profileError;

      const current = (profile as unknown as { eco_points?: number }).eco_points || 0;
      const { error: awardError } = await supabase
        .from("profiles")
        .update({ eco_points: current + photo.pointsAwarded })
        .eq("id", photo.studentId);

      if (awardError) throw awardError;

      if (photo.studentId) {
        try {
          await awardXp(
            photo.studentId,
            30,
            XP_SOURCES.ECO_PHOTO_APPROVED,
            `Eco photo approved: ${photo.actionType}`,
            supabase
          );
        } catch (err) {
          console.error("XP award failed:", err);
        }
      }

      setPendingPhotos((prev) => prev.filter((p) => p.id !== photo.id));
      setEcoSuccess("Approved! Eco points awarded to the student.");
      showToast("success", "Photo approved — eco points awarded!");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to approve photo.";
      setEcoError(message);
    } finally {
      setEcoApprovingId(null);
    }
  };

  const handleRejectPhoto = async (photo: PendingPhoto) => {
    setEcoError("");
    setEcoSuccess("");
    setEcoApprovingId(photo.id);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("eco_photos")
        .update({ status: "rejected", reviewed_at: new Date().toISOString() })
        .eq("id", photo.id);
      if (error) throw error;
      setPendingPhotos((prev) => prev.filter((p) => p.id !== photo.id));
      setEcoSuccess("Rejected. The student can submit a new photo if needed.");
      showToast("info", "Photo rejected.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to reject photo.";
      setEcoError(message);
    } finally {
      setEcoApprovingId(null);
    }
  };

  const handleDeleteLesson = (lessonId: string) => {
    setCustomLessons(customLessons.filter((l) => l.id !== lessonId));
  };

  const wpmSeries = selectedChild?.wpmData.length ? selectedChild.wpmData : [0, 0, 0, 0, 0, 0, 0];
  const wpmMax = Math.max(...wpmSeries, 1);

  return (
    <div className="font-sans">
      <Dialog
        open={showAddChildModal}
        onOpenChange={(open) => {
          setShowAddChildModal(open);
          if (!open) setAddChildError("");
        }}
      >
        <DialogContent className="sm:max-w-lg" showCloseButton>
          <DialogHeader>
            <DialogTitle>Add child</DialogTitle>
            <DialogDescription>Create a child profile linked to your parent account.</DialogDescription>
          </DialogHeader>
          {addChildError ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
              {addChildError}
            </div>
          ) : null}
          <div className="mgk-grid">
            <div className="space-y-2">
              <Label htmlFor="child-name">Child name</Label>
              <Input
                id="child-name"
                value={childForm.name}
                onChange={(e) => setChildForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Sarah"
                disabled={addChildLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="child-username">Username</Label>
              <Input
                id="child-username"
                value={childForm.username}
                onChange={(e) => setChildForm((p) => ({ ...p, username: e.target.value }))}
                placeholder="e.g. sarah10"
                disabled={addChildLoading}
              />
              <p className="text-xs text-muted-foreground">Used for linking and identifying the child.</p>
            </div>
            <div className="mgk-grid sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="child-age">Age</Label>
                <Input
                  id="child-age"
                  inputMode="numeric"
                  value={childForm.age}
                  onChange={(e) => setChildForm((p) => ({ ...p, age: e.target.value }))}
                  disabled={addChildLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="child-gender">Gender</Label>
                <select
                  id="child-gender"
                  className={selectClassName}
                  value={childForm.gender}
                  onChange={(e) =>
                    setChildForm((p) => ({ ...p, gender: e.target.value as "boy" | "girl" }))
                  }
                  disabled={addChildLoading}
                >
                  <option value="boy">Boy</option>
                  <option value="girl">Girl</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button type="button" variant="outline" disabled={addChildLoading} onClick={() => setShowAddChildModal(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={addChildLoading} onClick={() => void handleAddChild()}>
              {addChildLoading ? "Adding…" : "Add child"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex min-h-screen w-full">
        <aside
          className="hidden shrink-0 lg:flex lg:flex-col"
          style={{
            width: "240px",
            minHeight: "100vh",
            background: "linear-gradient(180deg, #1B4332 0%, #2D6A4F 100%)",
            padding: "24px 16px",
            position: "sticky",
            top: 0,
          }}
          aria-label="Dashboard sections"
        >
          <div
            className="flex items-center gap-3"
            style={{
              padding: "16px",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
              marginBottom: "24px",
            }}
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white">
              <LeafIcon />
            </div>
            <div>
              <p className="font-heading text-sm font-extrabold text-white">My Green Keys</p>
              <p className="text-xs font-semibold text-white/70">Parent</p>
            </div>
          </div>
          <nav className="flex flex-col">
            {SIDEBAR_LINKS.map((item) => {
              const active = hash === item.href;
              const Icon = item.Icon;
              const baseNav: React.CSSProperties = {
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 16px",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: 500,
                marginBottom: "4px",
                cursor: "pointer",
                transition: "all 0.2s",
                textDecoration: "none",
              };
              const activeNav: React.CSSProperties = active
                ? {
                    background: "rgba(82, 183, 136, 0.2)",
                    color: "#FFFFFF",
                    borderLeft: "4px solid #52B788",
                    paddingLeft: "12px",
                  }
                : {
                    color: "rgba(255,255,255,0.8)",
                  };
              return (
                <a
                  key={item.href}
                  href={item.href}
                  style={{ ...baseNav, ...activeNav }}
                  className={cn(!active && "hover:bg-white/10 hover:text-white")}
                >
                  <Icon className="size-5 shrink-0 opacity-90" strokeWidth={2.25} />
                  {item.label}
                </a>
              );
            })}
          </nav>
          <div style={{ marginTop: "auto", paddingTop: "24px" }}>
            <button
              type="button"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 16px",
                borderRadius: "12px",
                color: "rgba(255,255,255,0.85)",
                fontSize: "14px",
                fontWeight: 500,
                width: "100%",
                cursor: "pointer",
                background: "transparent",
                border: "none",
              }}
              className="transition-colors hover:bg-white/10 hover:text-white"
              onClick={async () => {
                const supabase = createClient();
                await supabase.auth.signOut();
                window.location.href = "/login";
              }}
            >
              <LogOut className="size-5 shrink-0" strokeWidth={2.25} />
              Logout
            </button>
          </div>
        </aside>

        <div
          className="min-w-0 flex-1"
          style={{
            minHeight: "100vh",
            backgroundColor: "#FAFAF7",
            backgroundImage: "radial-gradient(circle, #D1D5DB 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        >
          <div
            style={{
              maxWidth: "1280px",
              margin: "0 auto",
              paddingLeft: "32px",
              paddingRight: "32px",
              paddingTop: "32px",
              paddingBottom: "60px",
            }}
          >
            <div
              style={{
                marginBottom: "32px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "16px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <h1
                  style={{
                    fontSize: "32px",
                    fontWeight: 700,
                    color: "#1B4332",
                    marginBottom: "4px",
                  }}
                >
                  {greeting}, {parentName}!
                </h1>
                <p style={{ fontSize: "14px", color: "#4A6355" }}>
                  {new Date().toLocaleDateString(undefined, {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Button variant="ghost" size="icon-sm" className="text-[#1B4332] hover:bg-[#E8F5EE]" title="Notifications">
                  <Bell className="size-5" strokeWidth={2} />
                </Button>
                <a
                  href="#parent-billing"
                  title="Settings"
                  className="inline-flex size-9 items-center justify-center rounded-xl text-[#1B4332] hover:bg-[#E8F5EE] lg:hidden"
                >
                  <Settings className="size-5" strokeWidth={2} />
                </a>
                <div
                  className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#52B788]/25 text-sm font-extrabold text-[#1B4332]"
                  aria-hidden
                >
                  {parentName.slice(0, 1).toUpperCase() || "P"}
                </div>
              </div>
            </div>
        {childrenError ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">
            {childrenError}
          </div>
        ) : null}

        {certificateNotifs.length > 0 ? (
          <div>
            {certificateNotifs.map((n) => (
              <div
                key={n.id}
                style={{ ...SECTION_CARD, borderColor: "rgba(82, 183, 136, 0.35)", background: "#F0F9F4" }}
                className="flex flex-wrap items-center justify-between gap-3"
              >
                <p className="text-sm font-semibold text-[#1B4332]">{n.message}</p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="border-[#52B788]/40 text-[#1B4332]"
                  onClick={async () => {
                    try {
                      const supabase = createClient();
                      await supabase
                        .from("parent_notifications")
                        .update({ read_at: new Date().toISOString() })
                        .eq("id", n.id);
                    } catch {
                      // ignore
                    } finally {
                      setCertificateNotifs((prev) => prev.filter((x) => x.id !== n.id));
                    }
                  }}
                >
                  Dismiss
                </Button>
              </div>
            ))}
          </div>
        ) : null}

        {petWarnings.length > 0 ? (
          <div>
            {petWarnings.map((w) => (
              <div
                key={`${w.childName}-${w.petName}`}
                style={{ ...SECTION_CARD, borderColor: "#FDE68A", background: "#FFFBEB" }}
                className="flex items-start gap-2 text-sm font-semibold text-amber-950"
              >
                <PawPrint className="mt-0.5 h-5 w-5 shrink-0 text-amber-800" strokeWidth={2} aria-hidden />
                <span>
                  {w.petName} is hungry! Help {w.childName} type today!
                </span>
              </div>
            ))}
          </div>
        ) : null}

        {childrenLoading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="mgk-skeleton h-28 rounded-2xl" />
            ))}
          </div>
        ) : children.length === 0 ? (
          <section style={{ ...SECTION_CARD, scrollMarginTop: "112px" }}>
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
              <Image
                src="/images/ui/ui-empty-state.jpg"
                alt=""
                width={200}
                height={160}
                className="h-auto max-h-40 w-[200px] shrink-0 rounded-2xl object-cover opacity-90"
                sizes="200px"
              />
              <div className="flex-1 space-y-3">
                <h2 className="font-heading text-lg font-bold text-[#1B4332]">Add your first child</h2>
                <p className="text-base font-semibold text-[#4A6355]">
                  Create a linked child profile to track typing progress and eco actions.
                </p>
                <button
                  type="button"
                  style={{
                    background: "linear-gradient(135deg, #52B788, #40916C)",
                    color: "white",
                    padding: "10px 20px",
                    borderRadius: "9999px",
                    fontWeight: 700,
                    fontSize: "14px",
                    border: "none",
                    cursor: "pointer",
                  }}
                  onClick={() => setShowAddChildModal(true)}
                >
                  Add child
                </button>
              </div>
            </div>
          </section>
        ) : null}

        <section id="parent-overview" style={{ ...SECTION_CARD, scrollMarginTop: "112px" }}>
          <h2 style={SECTION_H2}>Overview</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "16px",
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #F0F9F4 0%, #E8F5EE 100%)",
                borderRadius: "16px",
                padding: "20px",
                border: "1px solid #D1E8DC",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  background: "rgba(82, 183, 136, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "12px",
                }}
              >
                <BookOpen className="h-5 w-5 text-[#52B788]" strokeWidth={2.25} aria-hidden />
              </div>
              <div style={{ fontSize: "32px", fontWeight: 700, color: "#1B4332", marginBottom: "4px" }}>
                {selectedChild?.lessonsCompleted ?? 0}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#4A6355",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Lessons
              </div>
              <div style={{ fontSize: "11px", color: "#6B7280", marginTop: "2px" }}>This child</div>
            </div>

            <div
              style={{
                background: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)",
                borderRadius: "16px",
                padding: "20px",
                border: "1px solid #BFDBFE",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  background: "rgba(82, 183, 136, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "12px",
                }}
              >
                <Zap className="h-5 w-5 text-[#52B788]" strokeWidth={2.25} aria-hidden />
              </div>
              <div style={{ fontSize: "32px", fontWeight: 700, color: "#1B4332", marginBottom: "4px" }}>
                {selectedChild?.avgWpm ?? 0}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#4A6355",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Avg WPM
              </div>
              <div style={{ fontSize: "11px", color: "#6B7280", marginTop: "2px" }}>Last 7 days</div>
            </div>

            <div
              style={{
                background: "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)",
                borderRadius: "16px",
                padding: "20px",
                border: "1px solid #FDE68A",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  background: "rgba(82, 183, 136, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "12px",
                }}
              >
                <Target className="h-5 w-5 text-[#52B788]" strokeWidth={2.25} aria-hidden />
              </div>
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: 700,
                  marginBottom: "4px",
                  color: (selectedChild?.accuracy ?? 0) >= 90 ? "#15803d" : "#d97706",
                }}
              >
                {selectedChild?.accuracy ?? 0}%
              </div>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#4A6355",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Accuracy
              </div>
              <div style={{ fontSize: "11px", color: "#6B7280", marginTop: "2px" }}>Recent sessions</div>
            </div>

            <div
              style={{
                background: "linear-gradient(135deg, #F0FDFA 0%, #CCFBF1 100%)",
                borderRadius: "16px",
                padding: "20px",
                border: "1px solid #99F6E4",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  background: "rgba(82, 183, 136, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "12px",
                }}
              >
                <Leaf className="h-5 w-5 text-[#52B788]" strokeWidth={2.25} aria-hidden />
              </div>
              <div style={{ fontSize: "32px", fontWeight: 700, color: "#1B4332", marginBottom: "4px" }}>
                {selectedChild?.ecoPhotos ?? 0}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#4A6355",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Eco
              </div>
              <div style={{ fontSize: "11px", color: "#6B7280", marginTop: "2px" }}>Approvals</div>
            </div>
          </div>
        </section>

        <section style={{ ...SECTION_CARD, scrollMarginTop: "112px" }}>
          <h2 style={SECTION_H2}>Daily streak &amp; Planet Ranger</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "16px",
            }}
          >
            {selectedChild ? (
              <ParentOverviewStreakCard child={selectedChild} />
            ) : (
              <div style={{ minHeight: "140px", borderRadius: "16px", background: "#F3F4F6" }} aria-hidden />
            )}
            {selectedChild ? (
              <ParentOverviewRangerCard child={selectedChild} />
            ) : (
              <div style={{ minHeight: "140px", borderRadius: "16px", background: "#F3F4F6" }} aria-hidden />
            )}
          </div>
        </section>

        <section style={{ ...SECTION_CARD, scrollMarginTop: "112px" }}>
          <h2 style={SECTION_H2}>Today&apos;s Eco Fact</h2>
          {!todaysFact ? (
            <div className="flex w-full items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-xl bg-[#E8F5EE] text-[#52B788]">
                <Sprout className="size-6" strokeWidth={2.25} aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="text-base font-bold text-[#1B4332]">Today&apos;s Eco Fact</p>
                <p className="text-sm font-medium text-[#4A6355]">Loading today&apos;s fact...</p>
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(72px, 120px) minmax(0, 1fr)",
                gap: "20px",
                alignItems: "center",
                background: "linear-gradient(135deg, #E8F5EE 0%, #F0F9F4 100%)",
                borderRadius: "16px",
                padding: "20px",
              }}
            >
              <div className="relative mx-auto h-[120px] w-[120px] shrink-0 overflow-hidden rounded-xl bg-white/50 sm:mx-0">
                <Image
                  src="/images/ui/ui-empty-garden.jpg"
                  alt="Eco Fact illustration"
                  fill
                  className="object-cover"
                  sizes="120px"
                  priority
                />
              </div>
              <div className="min-w-0">
                <p
                  className="text-xs font-bold tracking-widest text-[#52B788]"
                  style={{ textTransform: "uppercase", letterSpacing: "0.2em" }}
                >
                  Today&apos;s Eco Fact
                </p>
                <p className="mt-2 text-2xl leading-none" aria-hidden>
                  {todaysFact.emoji}
                </p>
                <p className="mt-2 text-base font-medium leading-relaxed text-[#1B4332]">{todaysFact.fact}</p>
                <p className="mt-2 text-xs italic text-[#6B7280]">Source: {todaysFact.source}</p>
              </div>
            </div>
          )}
        </section>

        {children.length > 0 ? (
          <section id="parent-children" style={{ ...SECTION_CARD, scrollMarginTop: "112px" }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "8px" }}>
              <h2 style={{ ...SECTION_H2, marginBottom: 0 }}>Children</h2>
              <button
                type="button"
                style={{
                  background: "linear-gradient(135deg, #52B788, #40916C)",
                  color: "white",
                  padding: "10px 20px",
                  borderRadius: "9999px",
                  fontWeight: 700,
                  fontSize: "14px",
                  border: "none",
                  cursor: "pointer",
                }}
                onClick={() => setShowAddChildModal(true)}
              >
                Add child
              </button>
            </div>
            <div
              role="tablist"
              aria-label="Select child"
              style={{
                display: "flex",
                gap: "8px",
                borderBottom: "2px solid #E5E7EB",
                marginBottom: "24px",
                flexWrap: "wrap",
              }}
            >
              {children.map((child) => {
                const active = child.id === selectedChildId;
                return (
                  <button
                    key={child.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setSelectedChildId(child.id)}
                    style={{
                      padding: "12px 20px",
                      color: active ? "#1B4332" : "#6B7280",
                      borderBottom: active ? "3px solid #52B788" : "3px solid transparent",
                      fontWeight: active ? 700 : 500,
                      cursor: "pointer",
                      background: "none",
                      borderTop: "none",
                      borderLeft: "none",
                      borderRight: "none",
                      marginBottom: "-2px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "14px",
                    }}
                  >
                    <UserRound
                      className={cn(
                        "h-5 w-5 shrink-0",
                        child.avatar === "girl" ? "text-pink-600" : "text-sky-600"
                      )}
                      strokeWidth={2}
                      aria-hidden
                    />
                    <span>{child.name}</span>
                    {child.username ? (
                      <Badge variant="secondary" className="ml-0 font-normal">
                        @{child.username}
                      </Badge>
                    ) : null}
                  </button>
                );
              })}
            </div>
            <p className="sr-only" aria-live="polite">
              {children.find((c) => c.id === selectedChildId)?.name ?? ""}
            </p>
          </section>
        ) : null}

        {selectedChild ? (
          <section id="parent-progress" style={{ ...SECTION_CARD, scrollMarginTop: "112px" }}>
            <div className="flex flex-wrap items-center justify-between gap-4" style={{ marginBottom: "20px" }}>
              <div className="flex flex-wrap items-center gap-4">
                <UserRound
                  className={cn(
                    "h-10 w-10 shrink-0",
                    selectedChild.avatar === "girl" ? "text-pink-600" : "text-sky-600"
                  )}
                  strokeWidth={2}
                  aria-hidden
                />
                <div>
                  <h2 style={{ ...SECTION_H2, marginBottom: "4px" }}>{selectedChild.name}&apos;s progress</h2>
                  <p className="text-sm text-[#4A6355]">Typing skills and eco actions</p>
                </div>
              </div>
              {selectedChild.studentProfileId ? (
                <Button
                  type="button"
                  variant="secondary"
                  className="shrink-0 border-[#52B788]/40 bg-[#E8F5EE] text-[#1B4332] hover:bg-[#D1E8DC]"
                  onClick={() =>
                    window.open(`/report/${selectedChild.studentProfileId}`, "_blank", "noopener,noreferrer")
                  }
                >
                  <BarChart3 className="mr-2 h-4 w-4" strokeWidth={2.25} aria-hidden />
                  Download Report
                </Button>
              ) : (
                <p className="max-w-xs break-words text-right text-xs text-[#6B7280]">
                  Link your child&apos;s account email to unlock printable reports.
                </p>
              )}
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <div style={INNER_PROGRESS_CARD}>
                <p className="mb-4 font-heading text-base font-bold text-[#1B4332]">WPM (last 7 days)</p>
                <div className="flex h-40 items-end gap-2">
                  {wpmSeries.map((wpm, i) => (
                    <div key={i} className="flex flex-1 flex-col items-center gap-1">
                      <span className="text-[10px] text-[#6B7280]">{wpm}</span>
                      <div
                        className="w-full rounded-t-md bg-[#52B788] transition-all"
                        style={{ height: `${(wpm / wpmMax) * 100}%`, minHeight: wpm > 0 ? 8 : 2 }}
                      />
                      <span className="text-[10px] text-[#6B7280]">D{i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={INNER_PROGRESS_CARD}>
                <p className="mb-4 font-heading text-base font-bold text-[#1B4332]">Performance</p>
                <div className="space-y-4">
                  <div>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-[#6B7280]">Accuracy</span>
                      <span className="font-semibold text-[#52B788]">{selectedChild.accuracy}%</span>
                    </div>
                    <Progress
                      value={selectedChild.accuracy}
                      className="[&_[data-slot=progress-track]]:h-2"
                    />
                  </div>
                  <div style={{ ...INNER_PROGRESS_CARD, background: "#FFFFFF" }}>
                    <p className="flex items-center gap-2 font-heading text-lg font-bold text-[#1B4332]">
                      <Flame className="h-5 w-5 shrink-0 text-orange-500" strokeWidth={2.25} aria-hidden />
                      {selectedChild.currentStreak} day streak
                    </p>
                    <p className="text-sm text-[#6B7280]">Keep it going!</p>
                  </div>
                  <div>
                    <p className="mb-2 text-sm text-[#6B7280]">Badges earned</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedChild.badges.map((badge, i) => (
                        <span key={i} className="text-2xl">
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ ...INNER_PROGRESS_CARD, borderColor: "rgba(82, 183, 136, 0.35)", background: "#F0F9F4" }}>
                <p className="mb-4 font-heading text-base font-bold text-[#1B4332]">Next milestone</p>
                <p className="text-sm leading-relaxed text-[#4A6355]">{selectedChild.nextMilestone}</p>
              </div>
            </div>
          </section>
        ) : null}

        <section id="parent-lessons" style={{ ...SECTION_CARD, scrollMarginTop: "112px" }}>
          <h2 style={SECTION_H2}>Create a custom typing lesson</h2>
          <div>
            <div style={{ marginBottom: "16px" }}>
              <label htmlFor="lesson-title" style={FORM_LABEL}>
                Lesson name
              </label>
              <Input
                id="lesson-title"
                value={lessonName}
                onChange={(e) => setLessonName(e.target.value)}
                placeholder="Give this lesson a name…"
                className="focus-visible:border-[#52B788] focus-visible:ring-[#52B788]/20"
                style={FORM_CONTROL}
              />
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label htmlFor="lesson-body" style={FORM_LABEL}>
                Lesson text
              </label>
              <Textarea
                id="lesson-body"
                value={lessonText}
                onChange={(e) => setLessonText(e.target.value.slice(0, 500))}
                placeholder="Paste text for your child to type…"
                rows={5}
                className="min-h-[120px] focus-visible:border-[#52B788] focus-visible:ring-[#52B788]/20"
                style={FORM_CONTROL}
              />
              <p className="mt-1 text-xs text-[#6B7280]">{lessonText.length}/500 characters</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <span style={FORM_LABEL}>Difficulty</span>
                <select
                  className="focus:border-[#52B788]"
                  style={{ ...FORM_CONTROL, height: "48px", cursor: "pointer" }}
                  value={lessonDifficulty}
                  onChange={(e) => setLessonDifficulty(e.target.value)}
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
              <div>
                <span style={FORM_LABEL}>Assign to</span>
                <select
                  className="focus:border-[#52B788]"
                  style={{ ...FORM_CONTROL, height: "48px", cursor: "pointer" }}
                  value={selectedChildId}
                  onChange={(e) => setSelectedChildId(e.target.value)}
                >
                  {children.map((child) => (
                    <option key={child.id} value={child.id}>
                      {child.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="button"
              style={{ ...PRIMARY_CTA, opacity: !lessonName || !lessonText ? 0.5 : 1 }}
              disabled={!lessonName || !lessonText}
              onClick={handleSaveLesson}
            >
              Save &amp; assign lesson
            </button>
          </div>

          {customLessons.length > 0 ? (
            <div className="space-y-3" style={{ marginTop: "24px" }}>
              <h3 className="font-heading text-base font-semibold text-[#1B4332]">Your custom lessons</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lesson</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Assigned to</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customLessons.map((lesson) => (
                    <TableRow key={lesson.id}>
                      <TableCell className="font-medium">{lesson.name}</TableCell>
                      <TableCell>{lesson.difficulty}</TableCell>
                      <TableCell>{children.find((c) => c.id === lesson.assignedTo)?.name || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{lesson.createdAt}</TableCell>
                      <TableCell className="text-right">
                        <Button type="button" size="sm" variant="destructive" onClick={() => handleDeleteLesson(lesson.id)}>
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : null}
        </section>

        <HabitQuestsSection />

        <section id="parent-eco" style={{ ...SECTION_CARD, scrollMarginTop: "112px" }}>
          <div className="flex flex-wrap items-center gap-3" style={{ marginBottom: "8px" }}>
            <h2 style={{ ...SECTION_H2, marginBottom: 0 }}>Eco photos awaiting approval</h2>
            {!ecoLoading && pendingPhotos.length > 0 ? (
              <span className="rounded-full bg-[#52B788] px-3 py-1 text-xs font-extrabold text-white">
                {pendingPhotos.length} pending
              </span>
            ) : null}
          </div>
          <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
            <defs>
              <filter id="kidsPencilFilterParent" x="-10%" y="-10%" width="120%" height="120%">
                <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="7" result="noise" />
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="noise"
                  scale="4"
                  xChannelSelector="R"
                  yChannelSelector="G"
                  result="displaced"
                />
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
                <feTurbulence type="fractalNoise" baseFrequency="0.15" numOctaves="2" seed="3" result="paper" />
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

          {ecoError ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {ecoError}
            </div>
          ) : null}
          {ecoSuccess ? (
            <div className="rounded-md border border-primary/40 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary">
              {ecoSuccess}
            </div>
          ) : null}

          {ecoLoading ? (
            <div className="mgk-grid sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="mgk-skeleton h-72 rounded-md" />
              ))}
            </div>
          ) : pendingPhotos.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <Image
                src="/images/ui/ui-empty-garden.jpg"
                alt=""
                width={200}
                height={160}
                className="h-auto opacity-80"
                style={{ width: "200px", maxWidth: "100%" }}
                sizes="200px"
              />
              <p className="text-lg font-bold text-[#1B4332]">No pending photos</p>
              <p className="max-w-md text-sm text-[#6B7280]">
                When your children submit eco actions, they&apos;ll show up here for approval.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pendingPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm"
                >
                  {photo.photoUrl ? (
                    // Dynamic Supabase URLs + SVG filter; next/image adds little here
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photo.photoUrl}
                      alt="Eco action submission"
                      className="h-48 w-full object-cover"
                      style={{
                        filter: "url(#kidsPencilFilterParent) contrast(140%) saturate(150%) brightness(110%)",
                      }}
                    />
                  ) : (
                    <div className="flex h-48 items-center justify-center bg-[#52B788] text-white">
                      <Globe className="h-12 w-12 opacity-90" strokeWidth={2} aria-hidden />
                    </div>
                  )}
                  <div className="space-y-3 p-4">
                    <p className="font-semibold text-[#1B4332]">{actionLabel(photo.actionType)}</p>
                    <p className="text-xs text-[#6B7280]">
                      {photo.dateSubmitted} ·{" "}
                      <span className="font-semibold text-[#52B788]">+{photo.pointsAwarded} pts</span>
                    </p>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        className="flex-1 bg-[#52B788] hover:bg-[#40916C]"
                        size="sm"
                        disabled={ecoApprovingId === photo.id}
                        onClick={() => void handleApprovePhoto(photo)}
                      >
                        {ecoApprovingId === photo.id ? "Working…" : "Approve"}
                      </Button>
                      <Button
                        type="button"
                        className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
                        size="sm"
                        variant="outline"
                        disabled={ecoApprovingId === photo.id}
                        onClick={() => void handleRejectPhoto(photo)}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section id="parent-summary" style={{ ...SECTION_CARD, scrollMarginTop: "112px" }}>
          <h2 style={SECTION_H2}>This week</h2>
          <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", alignItems: "center" }}>
            {[
              { Icon: BookOpen, label: "Lessons", value: "—" },
              { Icon: Clock, label: "Time", value: "—" },
              { Icon: TrendingUp, label: "WPM", value: "—" },
              { Icon: Sprout, label: "Eco", value: "—" },
            ].map(({ Icon, label, value }) => (
              <div key={label} className="flex items-center gap-2 text-[#1B4332]">
                <Icon className="h-4 w-4 shrink-0 text-[#52B788]" strokeWidth={2.25} aria-hidden />
                <span className="text-sm text-[#4A6355]">{label}</span>
                <span className="text-sm font-bold text-[#1B4332]">{value}</span>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="mt-6 transition-colors hover:bg-[#52B788] hover:text-white"
            style={{
              border: "2px solid #52B788",
              background: "transparent",
              color: "#52B788",
              padding: "10px 20px",
              borderRadius: "9999px",
              fontWeight: 700,
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            Send report to email
          </button>
        </section>

        <section id="parent-billing" style={{ ...SECTION_CARD, scrollMarginTop: "112px", paddingBottom: "36px" }}>
          <h2 style={SECTION_H2}>Subscription &amp; billing</h2>
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-2">
              <p className="text-xs text-[#6B7280]">Current plan</p>
              <p className="font-heading text-2xl font-bold text-[#1B4332]">Family plan</p>
              <p className="text-lg font-bold text-[#52B788]">$9.99/month</p>
              <p className="text-sm text-[#6B7280]">Next billing date: May 25, 2026</p>
              <a href="#" className="inline-block text-sm font-medium text-[#1B4332] underline underline-offset-2">
                Manage subscription
              </a>
              <div
                className="mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold text-[#15803d]"
                style={{ background: "#E8F5EE", border: "1px solid #D1E8DC" }}
              >
                <CheckCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
                Your account is in good standing
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-[#4A6355]">Promo code</p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
                <Input
                  placeholder="Enter code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 rounded-xl border-2 border-[#E5E7EB] focus-visible:border-[#52B788] focus-visible:ring-2 focus-visible:ring-[#52B788]/20"
                  style={{
                    padding: "14px 16px",
                    fontSize: "15px",
                  }}
                />
                <button
                  type="button"
                  style={{
                    padding: "14px 32px",
                    borderRadius: "12px",
                    fontSize: "15px",
                    fontWeight: 700,
                    background: "linear-gradient(135deg, #52B788 0%, #40916C 100%)",
                    color: "#FFFFFF",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: "0 4px 12px rgba(82, 183, 136, 0.25)",
                    whiteSpace: "nowrap",
                  }}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </section>
          </div>
        </div>
      </div>
    </div>
  );
}
