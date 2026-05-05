"use client";

import React, { useEffect, useMemo, startTransition, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  BookOpen,
  FileText,
  Flame,
  Globe,
  Home,
  Leaf,
  Sprout,
  LogOut,
  PawPrint,
  Settings,
  Shield,
  Sparkles,
  Target,
  UserRound,
  Users,
  Zap,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { awardXp, getProgress, XP_SOURCES, type RangerRank } from "@/lib/rangerHelpers";
import { RankBadge, rankProgressFillClassName } from "@/components/RankBadge";
import { ecoFacts } from "@/data/ecoFacts";
import { getTodayDate } from "@/lib/streakHelpers";
import { streakTierSurfaceClassName } from "@/components/StreakCounter";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
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
  "flex h-8 w-full rounded-lg border border-input bg-background px-2.5 py-1 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50";

const statCardClass = "mgk-card p-6";

const SIDEBAR_LINKS = [
  { href: "#parent-overview", label: "Overview", Icon: Home },
  { href: "#parent-children", label: "My Children", Icon: Users },
  { href: "#parent-progress", label: "Progress", Icon: BarChart3 },
  { href: "#parent-eco", label: "Eco Actions", Icon: Leaf },
  { href: "#parent-lessons", label: "Custom Lessons", Icon: BookOpen },
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
  const tier = streakTierSurfaceClassName(streak);
  const isLegendary = streak >= 100;
  const today = getTodayDate();
  const streakAtRisk =
    streak > 0 && child.lastStreakDate !== null && child.lastStreakDate < today;

  return (
    <div
      className={cn(
        "rounded-xl p-6 shadow-sm ring-1 ring-black/5 transition-shadow hover:shadow-lg border-2 overflow-hidden",
        tier,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className={cn("text-sm font-semibold", isLegendary ? "text-white/90" : "text-gray-700")}>
          Daily Streak
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/ranger"
            className={cn(
              "hidden items-center gap-1 rounded-full px-2 py-1 text-xs font-bold transition hover:opacity-90 md:inline-flex",
              isLegendary ? "text-white/95" : "text-purple-600",
            )}
          >
            <Shield className="h-3.5 w-3.5" aria-hidden />
            Ranger
          </Link>
          <Flame
            className={cn("h-8 w-8 shrink-0 stroke-[2.25]", streak > 0 ? "text-orange-500" : "text-gray-400")}
            aria-hidden
          />
        </div>
      </div>
      <p className={cn("mt-3 text-3xl font-bold tabular-nums leading-none", isLegendary && "text-white")}>
        {streak}
      </p>
      <p className={cn("mt-2 text-sm font-semibold", isLegendary ? "text-white/95" : "text-gray-800")}>
        {streak > 0 ? `${streak} day streak` : "Start a streak today"}
      </p>
      {streakAtRisk ? (
        <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-orange-600">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden />
          Streak ends today!
        </p>
      ) : null}
      <p className={cn("mt-3 text-xs", isLegendary ? "text-white/75" : "text-gray-500")}>
        Longest: {longest} days
      </p>
    </div>
  );
}

function ParentOverviewRangerCard({ child }: { child: Child }) {
  const xp = child.ranger_xp;
  const prog = getProgress(xp);
  const fill = rankProgressFillClassName(prog.currentRank.id);
  const isMax = prog.nextRank === null;

  return (
    <div className={statCardClass}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-gray-700">Planet Ranger</p>
        <Link
          href="/ranger"
          className="hidden items-center gap-1 text-xs font-bold text-purple-600 transition hover:opacity-90 md:inline-flex"
        >
          <Shield className="h-3.5 w-3.5" aria-hidden />
          Details
        </Link>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RankBadge xp={xp} rank={child.ranger_rank} variant="full" />
      </div>
      {isMax ? (
        <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-purple-600">
          <Sparkles className="h-4 w-4 shrink-0" aria-hidden />
          Maxed out!
        </p>
      ) : (
        <>
          <div className="mt-4 h-1.5 w-full rounded-full bg-gray-200">
            <div
              className={cn("h-full rounded-full transition-all", fill)}
              style={{ width: `${prog.progressPercent}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">
            {prog.xpToNext.toLocaleString()} XP to {prog.nextRank?.label}
          </p>
        </>
      )}
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
    <div className="min-h-screen bg-background font-sans">
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
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
              {addChildError}
            </div>
          ) : null}
          <div className="grid gap-4">
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
            <div className="grid gap-4 sm:grid-cols-2">
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

      <div className="mx-auto flex w-full max-w-[1400px]">
        <aside
          className="sticky top-0 hidden h-screen w-[240px] shrink-0 flex-col border-r border-[#E5E7EB] bg-white py-8 pl-5 pr-3 lg:flex"
          aria-label="Dashboard sections"
        >
          <div className="mb-8 flex items-center gap-3 px-2">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#2ECC71] text-white">
              <LeafIcon />
            </div>
            <div>
              <p className="font-heading text-sm font-extrabold text-[#1A2F23]">My Green Keys</p>
              <p className="text-xs font-semibold text-[#64748b]">Parent</p>
            </div>
          </div>
          <nav className="flex flex-col gap-1">
            {SIDEBAR_LINKS.map((item) => {
              const active = hash === item.href;
              const Icon = item.Icon;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-[12px] px-3 py-2.5 text-sm font-bold transition-all duration-200 ease-in-out",
                    active
                      ? "bg-[#2ECC71]/12 text-[#15803d]"
                      : "text-[#374151] hover:bg-[#FAFAFA] hover:text-[#1A2F23]"
                  )}
                >
                  <Icon className={cn("size-5 shrink-0", active ? "text-[#2ECC71]" : "text-[#64748b]")} strokeWidth={2.25} />
                  {item.label}
                </a>
              );
            })}
          </nav>
          <div className="mt-auto pt-8">
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-sm font-bold text-[#64748b] transition-colors hover:bg-red-50 hover:text-red-700"
              onClick={async () => {
                const supabase = createClient();
                await supabase.auth.signOut();
                window.location.href = "/login";
              }}
            >
              <LogOut className="size-5" strokeWidth={2.25} />
              Logout
            </button>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-[#E5E7EB] bg-white/95 px-4 py-4 backdrop-blur sm:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-heading text-lg font-extrabold text-[#1A2F23] sm:text-xl">
                  {greeting}, {parentName}!
                </p>
                <p className="text-sm font-semibold text-[#64748b]">
                  {new Date().toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon-sm" className="text-[#1A2F23] hover:bg-[#F1F5F9]" title="Notifications">
                  <Bell className="size-5" strokeWidth={2} />
                </Button>
                <a
                  href="#parent-billing"
                  title="Settings"
                  className="inline-flex size-9 items-center justify-center rounded-xl text-[#1A2F23] hover:bg-[#F1F5F9] lg:hidden"
                >
                  <Settings className="size-5" strokeWidth={2} />
                </a>
                <div
                  className="flex size-10 items-center justify-center rounded-full bg-[#2ECC71]/20 text-sm font-extrabold text-[#15803d]"
                  aria-hidden
                >
                  {parentName.slice(0, 1).toUpperCase() || "P"}
                </div>
              </div>
            </div>
          </header>

          <div className="mgk-container space-y-10 py-8 sm:py-10">
        {childrenError ? (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">
            {childrenError}
          </div>
        ) : null}

        {certificateNotifs.length > 0 ? (
          <div className="space-y-3">
            {certificateNotifs.map((n) => (
              <Card key={n.id} className="border-primary/30 bg-primary/5">
                <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                  <p className="text-sm font-semibold text-foreground">{n.message}</p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="border-primary/40"
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
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}

        {petWarnings.length > 0 ? (
          <div className="space-y-3">
            {petWarnings.map((w) => (
              <Card key={`${w.childName}-${w.petName}`} className="border-amber-200 bg-amber-50">
                <CardContent className="flex items-start gap-2 py-4 text-sm font-semibold text-amber-900">
                  <PawPrint className="mt-0.5 h-5 w-5 shrink-0 text-amber-800" strokeWidth={2} aria-hidden />
                  <span>
                    {w.petName} is hungry! Help {w.childName} type today!
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}

        {childrenLoading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="mgk-skeleton h-28 rounded-xl" />
            ))}
          </div>
        ) : children.length === 0 ? (
          <Card className="overflow-hidden">
            <CardContent className="flex flex-col items-center gap-4 py-10 text-center sm:flex-row sm:text-left">
              <div className="relative h-40 w-full max-w-[200px] shrink-0 overflow-hidden rounded-2xl">
                <Image src="/images/ui/ui-empty-state.jpg" alt="" fill className="object-cover" sizes="200px" />
              </div>
              <div className="flex-1 space-y-3">
                <CardTitle className="font-heading text-xl">Add your first child</CardTitle>
                <CardDescription className="text-base font-semibold">
                  Create a linked child profile to track typing progress and eco actions.
                </CardDescription>
                <Button className="rounded-[50px]" onClick={() => setShowAddChildModal(true)}>
                  Add child
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}

        <section id="parent-overview" className="scroll-mt-28">
          <h2 className="font-heading mb-6 text-[20px] font-bold text-foreground">Overview</h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
            <div className={statCardClass}>
              <BookOpen className="h-8 w-8 text-green-600" strokeWidth={2.25} aria-hidden />
              <p className="mt-3 text-sm font-normal text-[#6B7280]">Total lessons completed</p>
              <p className="mgk-stat-number mt-2 text-[36px] font-extrabold leading-none text-[#2ECC71]">
                {selectedChild?.lessonsCompleted ?? 0}
              </p>
            </div>
            <div className={statCardClass}>
              <Zap className="h-8 w-8 text-green-600" strokeWidth={2.25} aria-hidden />
              <p className="mt-3 text-sm font-normal text-[#6B7280]">Average WPM</p>
              <p className="mgk-stat-number mt-2 text-[36px] font-extrabold leading-none text-[#1A2F23]">
                {selectedChild?.avgWpm ?? 0}
              </p>
            </div>
            <div className={statCardClass}>
              <Target className="h-8 w-8 text-green-600" strokeWidth={2.25} aria-hidden />
              <p className="mt-3 text-sm font-normal text-[#6B7280]">Accuracy</p>
              <p
                className="mgk-stat-number mt-2 text-[36px] font-extrabold leading-none"
                style={{ color: (selectedChild?.accuracy ?? 0) >= 90 ? "#2ECC71" : "#D97706" }}
              >
                {selectedChild?.accuracy ?? 0}%
              </p>
            </div>
            <div className={statCardClass}>
              <Leaf className="h-8 w-8 text-green-600" strokeWidth={2.25} aria-hidden />
              <p className="mt-3 text-sm font-normal text-[#6B7280]">Eco Points</p>
              <p className="mgk-stat-number mt-2 text-[36px] font-extrabold leading-none text-[#2ECC71]">
                {selectedChild?.ecoPhotos ?? 0}
              </p>
            </div>
            {selectedChild ? (
              <ParentOverviewStreakCard child={selectedChild} />
            ) : (
              <div className={cn(statCardClass, "min-h-[140px]")} aria-hidden />
            )}
            {selectedChild ? (
              <ParentOverviewRangerCard child={selectedChild} />
            ) : (
              <div className={cn(statCardClass, "min-h-[140px]")} aria-hidden />
            )}
          </div>
          <div
            className={cn(
              "mt-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5",
              "flex flex-col gap-4 sm:flex-row sm:items-start"
            )}
          >
            {!todaysFact ? (
              <div className="flex w-full items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                  <Sprout className="size-6" strokeWidth={2.25} aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-bold text-gray-900">Today&apos;s Eco Fact</p>
                  <p className="text-sm font-semibold text-gray-600">Loading today&apos;s fact...</p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start gap-4">
                  <div className="relative size-24 shrink-0 overflow-hidden rounded-2xl bg-emerald-50 sm:size-28">
                    <Image
                      src="/images/ui/ui-empty-garden.jpg"
                      alt="Eco Fact illustration"
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 96px, 112px"
                      priority
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl" aria-hidden>
                        {todaysFact.emoji}
                      </span>
                      <p className="text-lg font-bold text-gray-900">Today&apos;s Eco Fact</p>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-gray-700">{todaysFact.fact}</p>
                    <p className="mt-2 text-xs italic text-gray-500">Source: {todaysFact.source}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        {children.length > 0 ? (
          <section id="parent-children" className="scroll-mt-28 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-heading text-[20px] font-bold text-foreground">Children</h2>
              <Button size="sm" onClick={() => setShowAddChildModal(true)}>
                Add child
              </Button>
            </div>
            <Tabs value={selectedChildId} onValueChange={setSelectedChildId}>
              <TabsList
                variant="line"
                className="h-auto min-h-10 w-full flex-wrap justify-start gap-2 rounded-[50px] bg-[#F1F5F9] p-1 sm:w-auto"
              >
                {children.map((child) => (
                  <TabsTrigger
                    key={child.id}
                    value={child.id}
                    className="gap-2 rounded-[50px] data-[state=active]:bg-[#2ECC71] data-[state=active]:text-white"
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
                      <Badge variant="secondary" className="ml-1 font-normal">
                        @{child.username}
                      </Badge>
                    ) : null}
                  </TabsTrigger>
                ))}
              </TabsList>
              {children.map((c) => (
                <TabsContent key={c.id} value={c.id} className="sr-only">
                  {c.name}
                </TabsContent>
              ))}
            </Tabs>
          </section>
        ) : null}

        {selectedChild ? (
          <section id="parent-progress" className="scroll-mt-28 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
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
                  <h2 className="font-heading text-[20px] font-bold text-foreground">
                    {selectedChild.name}&apos;s progress
                  </h2>
                  <p className="text-sm text-muted-foreground">Typing skills and eco actions</p>
                </div>
              </div>
              {selectedChild.studentProfileId ? (
                <Button
                  type="button"
                  variant="secondary"
                  className="shrink-0 border-primary/40 bg-primary/10 text-primary hover:bg-primary/15"
                  onClick={() =>
                    window.open(`/report/${selectedChild.studentProfileId}`, "_blank", "noopener,noreferrer")
                  }
                >
                  <BarChart3 className="mr-2 h-4 w-4" strokeWidth={2.25} aria-hidden />
                  Download Report
                </Button>
              ) : (
                <p className="max-w-xs break-words text-right text-xs text-muted-foreground">
                  Link your child&apos;s account email to unlock printable reports.
                </p>
              )}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="font-heading text-base">WPM (last 7 days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex h-40 items-end gap-2">
                    {wpmSeries.map((wpm, i) => (
                      <div key={i} className="flex flex-1 flex-col items-center gap-1">
                        <span className="text-[10px] text-muted-foreground">{wpm}</span>
                        <div
                          className="w-full rounded-t-md bg-primary transition-all"
                          style={{ height: `${(wpm / wpmMax) * 100}%`, minHeight: wpm > 0 ? 8 : 2 }}
                        />
                        <span className="text-[10px] text-muted-foreground">D{i + 1}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-heading text-base">Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-muted-foreground">Accuracy</span>
                      <span className="font-semibold text-primary">{selectedChild.accuracy}%</span>
                    </div>
                    <Progress
                      value={selectedChild.accuracy}
                      className="[&_[data-slot=progress-track]]:h-2"
                    />
                  </div>
                  <Card className="bg-muted/40">
                    <CardContent className="py-4">
                      <p className="flex items-center gap-2 font-heading text-lg font-bold">
                        <Flame className="h-5 w-5 shrink-0 text-orange-500" strokeWidth={2.25} aria-hidden />
                        {selectedChild.currentStreak} day streak
                      </p>
                      <p className="text-sm text-muted-foreground">Keep it going!</p>
                    </CardContent>
                  </Card>
                  <div>
                    <p className="mb-2 text-sm text-muted-foreground">Badges earned</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedChild.badges.map((badge, i) => (
                        <span key={i} className="text-2xl">
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/40 bg-primary/5">
                <CardHeader>
                  <CardTitle className="font-heading text-base">Next milestone</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">{selectedChild.nextMilestone}</p>
                </CardContent>
              </Card>
            </div>
          </section>
        ) : null}

        <section id="parent-lessons" className="scroll-mt-28 space-y-4">
          <h2 className="font-heading text-[20px] font-bold text-foreground">
            Create a custom typing lesson
          </h2>
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="lesson-title">Lesson name</Label>
                <Input
                  id="lesson-title"
                  value={lessonName}
                  onChange={(e) => setLessonName(e.target.value)}
                  placeholder="Give this lesson a name…"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lesson-body">Lesson text</Label>
                <Textarea
                  id="lesson-body"
                  value={lessonText}
                  onChange={(e) => setLessonText(e.target.value.slice(0, 500))}
                  placeholder="Paste text for your child to type…"
                  rows={5}
                />
                <p className="text-xs text-muted-foreground">{lessonText.length}/500 characters</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <select
                    className={selectClassName}
                    value={lessonDifficulty}
                    onChange={(e) => setLessonDifficulty(e.target.value)}
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Assign to</Label>
                  <select
                    className={selectClassName}
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
              <Button
                type="button"
                className="w-full"
                disabled={!lessonName || !lessonText}
                onClick={handleSaveLesson}
              >
                Save &amp; assign lesson
              </Button>
            </CardContent>
          </Card>

          {customLessons.length > 0 ? (
            <div className="space-y-3">
              <h3 className="font-heading text-base font-semibold">Your custom lessons</h3>
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

        <section id="parent-eco" className="scroll-mt-28 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-heading text-xl font-bold">Eco photos awaiting approval</h2>
            {!ecoLoading && pendingPhotos.length > 0 ? (
              <span className="rounded-full bg-[#2ECC71] px-3 py-1 text-xs font-extrabold text-white">
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
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {ecoError}
            </div>
          ) : null}
          {ecoSuccess ? (
            <div className="rounded-lg border border-primary/40 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary">
              {ecoSuccess}
            </div>
          ) : null}

          {ecoLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="mgk-skeleton h-72 rounded-xl" />
              ))}
            </div>
          ) : pendingPhotos.length === 0 ? (
            <Card className="overflow-hidden">
              <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
                <div className="relative h-44 w-full max-w-[280px] overflow-hidden rounded-2xl">
                  <Image src="/images/ui/ui-empty-garden.jpg" alt="" fill className="object-cover" sizes="280px" />
                </div>
                <p className="font-heading text-lg font-extrabold text-[#1A2F23]">No pending photos</p>
                <p className="max-w-md text-sm font-semibold text-muted-foreground">
                  When your children submit eco actions, they&apos;ll show up here for approval.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pendingPhotos.map((photo) => (
                <Card key={photo.id} className="overflow-hidden">
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
                    <div className="flex h-48 items-center justify-center bg-primary text-primary-foreground">
                      <Globe className="h-12 w-12 opacity-90" strokeWidth={2} aria-hidden />
                    </div>
                  )}
                  <CardContent className="space-y-3 py-4">
                    <p className="font-semibold">{actionLabel(photo.actionType)}</p>
                    <p className="text-xs text-muted-foreground">
                      {photo.dateSubmitted} ·{" "}
                      <span className="font-semibold text-primary">+{photo.pointsAwarded} pts</span>
                    </p>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        className="flex-1 bg-[#2ECC71] hover:bg-[#27ae60]"
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
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section id="parent-summary" className="scroll-mt-28 space-y-4">
          <h2 className="font-heading text-[20px] font-bold text-foreground">This week&apos;s summary</h2>
          <Card>
            <CardContent className="space-y-6 pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    ["Lessons completed", "—"],
                    ["Time spent", "—"],
                    ["WPM improvement", "—"],
                    ["Eco actions", "—"],
                  ].map(([label, value]) => (
                    <TableRow key={label}>
                      <TableCell className="text-muted-foreground">{label}</TableCell>
                      <TableCell className="text-right font-semibold text-primary">{value}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Button type="button" variant="secondary">
                Send report to email
              </Button>
            </CardContent>
          </Card>
        </section>

        <section id="parent-billing" className="scroll-mt-28 space-y-4 pb-16">
          <h2 className="font-heading text-[20px] font-bold text-foreground">
            Subscription &amp; billing
          </h2>
          <Card>
            <CardContent className="space-y-6 pt-6">
              <div className="grid gap-8 lg:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Current plan</p>
                  <p className="font-heading text-xl font-bold">Family plan</p>
                  <p className="text-lg font-semibold text-primary">$9.99/month</p>
                  <p className="text-sm text-muted-foreground">Next billing date: May 25, 2026</p>
                  <a href="#" className="text-sm font-semibold text-primary hover:underline">
                    Manage subscription →
                  </a>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Promo code</p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter promo code…"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                    />
                    <Button type="button" variant="secondary">
                      Apply
                    </Button>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm font-medium text-primary">
                Your account is in good standing. All family features are unlocked.
              </div>
            </CardContent>
          </Card>
        </section>
          </div>
        </div>
      </div>
    </div>
  );
}
