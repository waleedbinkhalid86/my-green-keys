"use client";

import Image from "next/image";
import { useEffect, startTransition, useState, type CSSProperties } from "react";
import {
  Activity,
  Bird,
  BookOpen,
  Copy,
  Droplets,
  FileBarChart,
  GraduationCap,
  LayoutDashboard,
  Leaf,
  LogOut,
  Recycle,
  Settings,
  Sprout,
  Star,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  archiveClass,
  createClass,
  fetchClassEnrollments,
  fetchEnrollmentCountsByClassIds,
  fetchMyClasses,
} from "@/lib/kid-login/class-api";
import type { SchoolClass } from "@/lib/kid-login/types";
import { loadReportBranding, saveReportBranding } from "@/lib/report/branding";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BulkStudentUploadModal } from "@/components/teacher/BulkStudentUploadModal";
const TEACHER_SIDEBAR = [
  { href: "#teacher-overview", label: "Overview", Icon: LayoutDashboard },
  { href: "#teacher-classes", label: "My Classes", Icon: GraduationCap },
  { href: "#teacher-students", label: "Students", Icon: Users },
  { href: "#teacher-leaderboard", label: "Leaderboard", Icon: Trophy },
  { href: "#teacher-lessons", label: "Custom Lessons", Icon: BookOpen },
  { href: "#teacher-school", label: "School Settings", Icon: Settings },
] as const;

const SECTION_CARD: CSSProperties = {
  background: "#FFFFFF",
  borderRadius: "20px",
  padding: "28px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
  border: "1px solid #E5E7EB",
  marginBottom: "24px",
};

const SECTION_H2: CSSProperties = {
  fontSize: "20px",
  fontWeight: 700,
  color: "#1B4332",
  marginBottom: "20px",
};

const FORM_LABEL: CSSProperties = {
  fontSize: "13px",
  fontWeight: 700,
  color: "#1B4332",
  marginBottom: "8px",
  display: "block",
};

const FORM_CONTROL: CSSProperties = {
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

const PRIMARY_CTA: CSSProperties = {
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

const SCROLL_SECTION: CSSProperties = { scrollMarginTop: "96px" };

export default function TeacherDashboard() {
  const { showToast } = useToast();
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [assignmentText, setAssignmentText] = useState("");
  const [lessonName, setLessonName] = useState("");
  const [difficulty, setDifficulty] = useState("Beginner");
  const [assignTo, setAssignTo] = useState("class");
  const [schedule, setSchedule] = useState("now");
  const [searchStudent, setSearchStudent] = useState("");
  const [studentPage, setStudentPage] = useState(1);
  const [hash, setHash] = useState("");
  const STUDENT_PAGE_SIZE = 5;
  const [schoolName, setSchoolName] = useState("Green Valley Primary School");
  const [schoolLogoDataUrl, setSchoolLogoDataUrl] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState("#2ECC71");
  const [teacherName, setTeacherName] = useState("there");

  const [teacherId, setTeacherId] = useState<string>("");
  const [classesLoading, setClassesLoading] = useState(true);
  const [classesError, setClassesError] = useState("");
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [enrollmentCounts, setEnrollmentCounts] = useState<Record<string, number>>({});
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [showCreateClass, setShowCreateClass] = useState(false);
  const [createClassName, setCreateClassName] = useState("");
  const [createClassSchool, setCreateClassSchool] = useState("");
  const [createClassGrade, setCreateClassGrade] = useState("");
  const [createClassLoading, setCreateClassLoading] = useState(false);
  const [createClassError, setCreateClassError] = useState("");
  const [showClassCodeModal, setShowClassCodeModal] = useState(false);
  const [newlyCreatedClass, setNewlyCreatedClass] = useState<SchoolClass | null>(null);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState("");
  const [enrolledStudents, setEnrolledStudents] = useState<
    Array<{ id: string; full_name: string | null; email: string | null }>
  >([]);
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  const leaderboardData = [
    { rank: 1, name: "Sarah Ahmed", wpm: 42, accuracy: 96, lessons: 28, ecoPoints: 420, streak: 7, badge: "trophy" as const },
    { rank: 2, name: "Omar Khan", wpm: 38, accuracy: 94, lessons: 25, ecoPoints: 380, streak: 5, badge: "star" as const },
    { rank: 3, name: "Fatima Ali", wpm: 35, accuracy: 91, lessons: 22, ecoPoints: 340, streak: 4, badge: "leaf" as const },
    { rank: 4, name: "Zahra Hassan", wpm: 33, accuracy: 90, lessons: 20, ecoPoints: 310, streak: 3, badge: "" as const },
    { rank: 5, name: "Amir Ibrahim", wpm: 31, accuracy: 88, lessons: 19, ecoPoints: 290, streak: 2, badge: "" as const },
    { rank: 6, name: "Noor Rashid", wpm: 29, accuracy: 87, lessons: 18, ecoPoints: 260, streak: 2, badge: "" as const },
    { rank: 7, name: "Hana Karim", wpm: 28, accuracy: 86, lessons: 17, ecoPoints: 240, streak: 1, badge: "" as const },
    { rank: 8, name: "Karim Saleh", wpm: 26, accuracy: 84, lessons: 16, ecoPoints: 220, streak: 1, badge: "" as const },
    { rank: 9, name: "Layla Ahmed", wpm: 25, accuracy: 83, lessons: 15, ecoPoints: 200, streak: 0, badge: "" as const },
    { rank: 10, name: "Hassan Ali", wpm: 24, accuracy: 82, lessons: 14, ecoPoints: 180, streak: 0, badge: "" as const },
  ];

  const allStudentsData = [
    { id: 1, name: "Sarah Ahmed", gender: "F", age: 10, wpm: 42, accuracy: 96, lessons: 28, lastActive: "10 mins ago", status: "active" },
    { id: 2, name: "Omar Khan", gender: "M", age: 11, wpm: 38, accuracy: 94, lessons: 25, lastActive: "1 hour ago", status: "active" },
    { id: 3, name: "Fatima Ali", gender: "F", age: 10, wpm: 35, accuracy: 91, lessons: 22, lastActive: "3 hours ago", status: "active" },
    { id: 4, name: "Amir Ibrahim", gender: "M", age: 12, wpm: 31, accuracy: 88, lessons: 19, lastActive: "1 day ago", status: "needs-attention" },
    { id: 5, name: "Noor Rashid", gender: "F", age: 10, wpm: 29, accuracy: 87, lessons: 18, lastActive: "3 days ago", status: "needs-attention" },
    { id: 6, name: "Hana Karim", gender: "F", age: 11, wpm: 28, accuracy: 86, lessons: 17, lastActive: "5 days ago", status: "inactive" },
    { id: 7, name: "Karim Saleh", gender: "M", age: 10, wpm: 26, accuracy: 84, lessons: 16, lastActive: "1 week ago", status: "inactive" },
    { id: 8, name: "Layla Ahmed", gender: "F", age: 9, wpm: 25, accuracy: 83, lessons: 15, lastActive: "2 weeks ago", status: "inactive" },
  ];

  const ecoFeedData = [
    { id: 1, studentName: "Sarah", action: "Watering plants", Icon: Droplets, time: "2 hours ago" },
    { id: 2, studentName: "Omar", action: "Planted a tree", Icon: Sprout, time: "Yesterday" },
    { id: 3, studentName: "Fatima", action: "Water for birds", Icon: Bird, time: "2 days ago" },
    { id: 4, studentName: "Zahra", action: "Recycling bin sort", Icon: Recycle, time: "3 days ago" },
    { id: 5, studentName: "Amir", action: "Composting", Icon: Leaf, time: "4 days ago" },
  ];

  const savedLessons = [
    { id: 1, name: "The Water Cycle", createdAt: "Mar 15", uses: 3 },
    { id: 2, name: "Solar Energy Facts", createdAt: "Mar 10", uses: 5 },
    { id: 3, name: "Biodiversity Story", createdAt: "Feb 28", uses: 2 },
  ];

  const filteredStudents = allStudentsData.filter((s) =>
    s.name.toLowerCase().includes(searchStudent.toLowerCase())
  );

  const studentPageCount = Math.max(1, Math.ceil(filteredStudents.length / STUDENT_PAGE_SIZE));
  const pagedStudents = filteredStudents.slice(
    (studentPage - 1) * STUDENT_PAGE_SIZE,
    studentPage * STUDENT_PAGE_SIZE
  );

  useEffect(() => {
    setStudentPage(1);
  }, [searchStudent]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setHash(window.location.hash || "#teacher-overview");
    const onHash = () => setHash(window.location.hash || "#teacher-overview");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const activeClass = classes.find((c) => c.id === selectedClassId);
  const activeClassLabel = activeClass?.name?.trim() || "Your class";
  const activeStudentCount = enrollmentCounts[selectedClassId] ?? enrolledStudents.length;

  const initials = (name: string) =>
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "?";

  const loadClasses = async () => {
    setClassesLoading(true);
    setClassesError("");
    try {
      const supabase = createClient();
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!userData.user) {
        setClasses([]);
        setEnrollmentCounts({});
        setTeacherId("");
        setSelectedClassId("");
        setClassesError("You must be logged in to view classes.");
        return;
      }
      setTeacherId(userData.user.id);

      const list = await fetchMyClasses();
      const counts = await fetchEnrollmentCountsByClassIds(list.map((c) => c.id));
      setClasses(list);
      setEnrollmentCounts(counts);
      if (list.length > 0) {
        setSelectedClassId((prev) =>
          prev && list.some((c) => c.id === prev) ? prev : list[0].id
        );
      } else {
        setSelectedClassId("");
      }
    } catch (err) {
      setClassesError(err instanceof Error ? err.message : "Failed to load classes.");
      setClasses([]);
      setEnrollmentCounts({});
      setSelectedClassId("");
    } finally {
      setClassesLoading(false);
    }
  };

  const loadEnrolledStudents = async (classId: string) => {
    if (!classId) {
      setEnrolledStudents([]);
      return;
    }
    setStudentsLoading(true);
    setStudentsError("");
    try {
      const enrollments = await fetchClassEnrollments(classId);
      setEnrolledStudents(
        enrollments.map((e) => ({
          id: e.student_auth_user_id,
          full_name: e.display_name,
          email: null,
        }))
      );
    } catch (err) {
      setStudentsError(err instanceof Error ? err.message : "Failed to load students.");
      setEnrolledStudents([]);
    } finally {
      setStudentsLoading(false);
    }
  };

  useEffect(() => {
    startTransition(() => {
      void loadClasses();
    });
  }, []);

  useEffect(() => {
    startTransition(() => {
      void (async () => {
        try {
          const supabase = createClient();
          const { data: userData } = await supabase.auth.getUser();
          if (!userData.user) return;
          const { data } = await supabase.from("profiles").select("full_name").eq("id", userData.user.id).maybeSingle();
          const n = (data as { full_name?: string } | null)?.full_name?.trim();
          setTeacherName(n || "there");
        } catch {
          setTeacherName("there");
        }
      })();
    });
  }, []);

  useEffect(() => {
    const b = loadReportBranding();
    if (b.name.trim()) setSchoolName(b.name);
    setSchoolLogoDataUrl(b.logoDataUrl);
  }, []);

  useEffect(() => {
    startTransition(() => {
      void loadEnrolledStudents(selectedClassId);
    });
  }, [selectedClassId]);

  const handleCreateClass = async () => {
    setCreateClassError("");
    setCreateClassLoading(true);
    try {
      if (!teacherId) {
        setCreateClassError("You must be logged in to create a class.");
        return;
      }
      if (!createClassName.trim()) {
        setCreateClassError("Class name is required.");
        return;
      }

      const newRow = await createClass({
        name: createClassName.trim(),
        school_name: createClassSchool.trim() || undefined,
        grade_level: createClassGrade.trim() || undefined,
      });

      setShowCreateClass(false);
      setCreateClassName("");
      setCreateClassSchool("");
      setCreateClassGrade("");
      setNewlyCreatedClass(newRow);
      setShowClassCodeModal(true);
      await loadClasses();
      setSelectedClassId(newRow.id);
    } catch (err) {
      setCreateClassError(err instanceof Error ? err.message : "Failed to create class.");
    } finally {
      setCreateClassLoading(false);
    }
  };

  const handleArchiveClass = async (classId: string) => {
    if (!window.confirm("Archive this class? Students keep accounts but the class will be hidden from your list.")) {
      return;
    }
    try {
      await archiveClass(classId);
      showToast("success", "Class archived.");
      if (selectedClassId === classId) setSelectedClassId("");
      await loadClasses();
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Could not archive class.");
    }
  };

  const copyClassCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      showToast("success", "Class code copied!");
    } catch {
      showToast("error", "Could not copy code.");
    }
  };

  const scrollToEnrolledStudents = () => {
    document.getElementById("teacher-enrolled-students")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const rankCircleStyle = (rank: number): CSSProperties => {
    if (rank === 1) {
      return {
        width: "50px",
        height: "50px",
        borderRadius: "50%",
        background: "linear-gradient(135deg, #FCD34D, #F59E0B)",
        color: "#FFFFFF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: "16px",
        flexShrink: 0,
      };
    }
    if (rank === 2) {
      return {
        width: "50px",
        height: "50px",
        borderRadius: "50%",
        background: "linear-gradient(135deg, #D1D5DB, #9CA3AF)",
        color: "#FFFFFF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: "16px",
        flexShrink: 0,
      };
    }
    if (rank === 3) {
      return {
        width: "50px",
        height: "50px",
        borderRadius: "50%",
        background: "linear-gradient(135deg, #FB923C, #C2410C)",
        color: "#FFFFFF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: "16px",
        flexShrink: 0,
      };
    }
    return {
      width: "50px",
      height: "50px",
      borderRadius: "50%",
      background: "#E5E7EB",
      color: "#6B7280",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 700,
      fontSize: "16px",
      flexShrink: 0,
    };
  };

  return (
    <div style={{ minHeight: "100vh" }} className="font-sans">
      <Dialog
        open={showCreateClass}
        onOpenChange={(open) => {
          setShowCreateClass(open);
          if (!open) setCreateClassError("");
        }}
      >
        <DialogContent className="sm:max-w-md" showCloseButton>
          <DialogHeader>
            <DialogTitle>Create class</DialogTitle>
            <DialogDescription>
              We&apos;ll generate a unique 8-character class code students can use to join.
            </DialogDescription>
          </DialogHeader>
          {createClassError ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
              {createClassError}
            </div>
          ) : null}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="create-class-name">Class name</Label>
              <Input
                id="create-class-name"
                value={createClassName}
                onChange={(e) => setCreateClassName(e.target.value)}
                placeholder="e.g. Mrs. Khan's Grade 7B"
                disabled={createClassLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-class-school">School name (optional)</Label>
              <Input
                id="create-class-school"
                value={createClassSchool}
                onChange={(e) => setCreateClassSchool(e.target.value)}
                placeholder="e.g. Green Valley Primary"
                disabled={createClassLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-class-grade">Grade level (optional)</Label>
              <select
                id="create-class-grade"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50"
                value={createClassGrade}
                onChange={(e) => setCreateClassGrade(e.target.value)}
                disabled={createClassLoading}
              >
                <option value="">—</option>
                <option value="K">K</option>
                {Array.from({ length: 12 }, (_, i) => String(i + 1)).map((g) => (
                  <option key={g} value={g}>
                    Grade {g}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button variant="outline" type="button" disabled={createClassLoading} onClick={() => setShowCreateClass(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={createClassLoading} onClick={() => void handleCreateClass()}>
              {createClassLoading ? "Creating…" : "Create class"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showClassCodeModal}
        onOpenChange={(open) => {
          setShowClassCodeModal(open);
          if (!open) setNewlyCreatedClass(null);
        }}
      >
        <DialogContent className="sm:max-w-md" showCloseButton>
          <div className="flex flex-col items-center text-center">
            <div className="text-6xl" aria-hidden>
              🎓
            </div>
            <DialogHeader className="mt-2">
              <DialogTitle className="text-center text-xl">
                {newlyCreatedClass?.name ? `${newlyCreatedClass.name} is ready!` : "Class is ready!"}
              </DialogTitle>
              <DialogDescription className="text-center">
                Share this class code with your students. They&apos;ll use it to join.
              </DialogDescription>
            </DialogHeader>
            {newlyCreatedClass ? (
              <div
                className="mt-4 w-full rounded-2xl border-2 border-[#52B788] bg-[#F0F9F4] px-4 py-5"
                style={{ boxShadow: "0 4px 12px rgba(82, 183, 136, 0.2)" }}
              >
                <p className="text-xs font-bold uppercase tracking-widest text-[#40916C]">Class code</p>
                <p
                  className="mt-2 break-all font-mono text-4xl font-extrabold text-[#1B4332]"
                  style={{ letterSpacing: "0.25em" }}
                >
                  {newlyCreatedClass.class_code}
                </p>
              </div>
            ) : null}
            <div className="mt-6 flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
              <Button
                type="button"
                className="w-full bg-[#52B788] hover:bg-[#40916C] sm:w-auto"
                disabled={!newlyCreatedClass}
                onClick={() => newlyCreatedClass && void copyClassCode(newlyCreatedClass.class_code)}
              >
                <Copy className="mr-2 h-4 w-4" aria-hidden />
                Copy code
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => {
                  setShowClassCodeModal(false);
                  setNewlyCreatedClass(null);
                }}
              >
                Got it ✓
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {selectedClassId && activeClass ? (
        <BulkStudentUploadModal
          open={showBulkUpload}
          onOpenChange={setShowBulkUpload}
          classId={selectedClassId}
          className={activeClass.name}
          schoolName={activeClass.school_name || schoolName}
          onStudentsAdded={() => {
            void loadClasses();
            void loadEnrolledStudents(selectedClassId);
          }}
        />
      ) : null}

      <div style={{ display: "flex", minHeight: "100vh", width: "100%" }}>
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
          aria-label="Teacher navigation"
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
              <Leaf className="size-5" strokeWidth={2.25} aria-hidden />
            </div>
            <div>
              <p className="font-heading text-sm font-extrabold text-white">My Green Keys</p>
              <p className="text-xs font-semibold text-white/70">Teacher</p>
            </div>
          </div>
          <nav className="flex flex-col">
            {TEACHER_SIDEBAR.map((item) => {
              const active = hash === item.href;
              const Icon = item.Icon;
              const baseNav: CSSProperties = {
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
              const activeNav: CSSProperties = active
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
          style={{
            minWidth: 0,
            flex: 1,
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
            <div style={{ marginBottom: "32px" }}>
              <h1
                style={{
                  fontSize: "32px",
                  fontWeight: 700,
                  color: "#1B4332",
                  marginBottom: "4px",
                }}
              >
                Welcome back, {teacherName}!
              </h1>
              <p style={{ fontSize: "14px", color: "#4A6355" }}>
                {activeClassLabel} · {activeStudentCount} {activeStudentCount === 1 ? "student" : "students"}
              </p>
            </div>

            <section id="teacher-overview" style={{ ...SECTION_CARD, ...SCROLL_SECTION }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "16px",
                }}
              >
                {[
                  {
                    Icon: Users,
                    label: "Active Students",
                    sub: "This class",
                    value: activeStudentCount ? String(activeStudentCount) : "—",
                    grad: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)",
                    border: "#BFDBFE",
                    iconBg: "rgba(59, 130, 246, 0.12)",
                    iconColor: "#1D4ED8",
                  },
                  {
                    Icon: BookOpen,
                    label: "Lessons Completed",
                    sub: "Connect analytics",
                    value: "—",
                    grad: "linear-gradient(135deg, #F0F9F4 0%, #E8F5EE 100%)",
                    border: "#BBF7D0",
                    iconBg: "rgba(34, 197, 94, 0.12)",
                    iconColor: "#15803D",
                  },
                  {
                    Icon: Zap,
                    label: "Class Avg WPM",
                    sub: "Last 7 days",
                    value: "—",
                    grad: "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)",
                    border: "#FDE68A",
                    iconBg: "rgba(245, 158, 11, 0.15)",
                    iconColor: "#B45309",
                  },
                  {
                    Icon: Leaf,
                    label: "Eco Actions",
                    sub: "This week",
                    value: "—",
                    grad: "linear-gradient(135deg, #F0FDFA 0%, #CCFBF1 100%)",
                    border: "#99F6E4",
                    iconBg: "rgba(20, 184, 166, 0.12)",
                    iconColor: "#0F766E",
                  },
                ].map(({ Icon, label, sub, value, grad, border, iconBg, iconColor }) => (
                  <div
                    key={label}
                    style={{
                      background: grad,
                      borderRadius: "16px",
                      padding: "20px",
                      border: `1px solid ${border}`,
                    }}
                  >
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "10px",
                        background: iconBg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon className="size-5" style={{ color: iconColor }} strokeWidth={2.25} aria-hidden />
                    </div>
                    <p
                      style={{
                        fontSize: "32px",
                        fontWeight: 700,
                        color: "#1B4332",
                        marginTop: "12px",
                        marginBottom: "8px",
                        lineHeight: 1.1,
                      }}
                    >
                      {value}
                    </p>
                    <p
                      style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#4A6355",
                        marginBottom: "6px",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {label}
                    </p>
                    <p style={{ fontSize: "11px", color: "#6B7280" }}>{sub}</p>
                  </div>
                ))}
              </div>

              <div
                style={{
                  marginTop: "20px",
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: "20px",
                  fontSize: "13px",
                  color: "#6B7280",
                }}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                  <GraduationCap className="size-4 shrink-0 text-[#9CA3AF]" strokeWidth={2} aria-hidden />
                  <span>
                    Class: <strong className="font-semibold text-[#4A6355]">{activeClassLabel}</strong>
                  </span>
                </span>
                <span style={{ color: "#D1D5DB" }} aria-hidden>
                  ·
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                  <Users className="size-4 shrink-0 text-[#9CA3AF]" strokeWidth={2} aria-hidden />
                  <span>
                    Students:{" "}
                    <strong className="font-semibold text-[#4A6355]">
                      {activeStudentCount ? String(activeStudentCount) : "—"}
                    </strong>
                  </span>
                </span>
                <span style={{ color: "#D1D5DB" }} aria-hidden>
                  ·
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                  <Activity className="size-4 shrink-0 text-[#9CA3AF]" strokeWidth={2} aria-hidden />
                  <span>
                    Status:{" "}
                    <strong className="font-semibold text-[#4A6355]">
                      {activeStudentCount ? "Active" : "Getting started"}
                    </strong>
                  </span>
                </span>
              </div>
            </section>

            <section id="teacher-classes" style={{ ...SECTION_CARD, ...SCROLL_SECTION }}>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: "16px",
                  marginBottom: "20px",
                }}
              >
                <h2 style={{ ...SECTION_H2, marginBottom: 0 }}>Class overview</h2>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  {activeClass ? (
                    <button
                      type="button"
                      className="text-sm font-bold text-[#1B4332] transition-colors hover:bg-[#E8F5EE]"
                      style={{
                        padding: "10px 18px",
                        borderRadius: "9999px",
                        border: "2px solid #E5E7EB",
                        background: "#FFFFFF",
                        cursor: "pointer",
                      }}
                      onClick={async () => {
                        if (!activeClass) return;
                        await copyClassCode(activeClass.class_code);
                      }}
                    >
                      <span className="inline-flex items-center gap-2">
                        <Copy className="size-4" strokeWidth={2.5} aria-hidden />
                        Copy code
                      </span>
                    </button>
                  ) : null}
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
                    onClick={() => {
                      setCreateClassError("");
                      setShowCreateClass(true);
                    }}
                  >
                    Create New Class
                  </button>
                </div>
              </div>

              {activeClass ? (
                <p className="text-sm font-semibold text-[#4A6355]" style={{ marginBottom: "16px" }}>
                  <span className="font-mono font-bold text-[#1B4332]">{activeClass.name}</span>
                  <span className="mx-2 text-[#CBD5E1]">·</span>
                  Code{" "}
                  <span className="font-mono font-extrabold tracking-widest text-[#52B788]">
                    {activeClass.class_code}
                  </span>
                </p>
              ) : null}

              {classesError ? (
                <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {classesError}
                </div>
              ) : null}

              {classesLoading ? (
                <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-8 text-center text-sm text-[#6B7280]">
                  Loading classes…
                </div>
              ) : classes.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px 20px",
                    background: "#F9FAFB",
                    borderRadius: "16px",
                  }}
                >
                  <h3 style={{ color: "#1B4332", fontWeight: 700, marginBottom: 8 }}>No classes yet</h3>
                  <p style={{ color: "#6B7280", fontSize: 14 }}>
                    Create a class to generate a code students can use to join.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {classes.map((c) => {
                      const selected = c.id === selectedClassId;
                      const count = enrollmentCounts[c.id] ?? 0;
                      return (
                        <div
                          key={c.id}
                          className={cn(
                            "rounded-2xl border bg-white p-4 transition-shadow",
                            selected ? "border-[#52B788] shadow-[0_4px_14px_rgba(82,183,136,0.15)]" : "border-[#E5E7EB]"
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="font-heading truncate text-base font-extrabold text-[#1B4332]">{c.name}</p>
                              {c.school_name ? (
                                <p className="mt-0.5 truncate text-xs text-muted-foreground">{c.school_name}</p>
                              ) : null}
                              <p className="mt-2 text-xs font-semibold text-[#6B7280]">
                                {count} {count === 1 ? "student" : "students"}
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <code className="rounded-lg border border-[#D1E8DC] bg-[#F9FAFB] px-2.5 py-1.5 font-mono text-sm font-bold tracking-wider text-[#1B4332]">
                              {c.class_code}
                            </code>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-8 border-[#52B788]/50 text-xs font-semibold"
                              onClick={() => void copyClassCode(c.class_code)}
                            >
                              <Copy className="mr-1 h-3.5 w-3.5" aria-hidden />
                              Copy
                            </Button>
                          </div>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <Button
                              type="button"
                              size="sm"
                              className={cn(
                                "font-semibold",
                                selected ? "bg-[#1B4332] hover:bg-[#1B4332]/90" : "bg-[#52B788] hover:bg-[#40916C]"
                              )}
                              onClick={() => {
                                setSelectedClassId(c.id);
                                scrollToEnrolledStudents();
                              }}
                            >
                              View students
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="border-destructive/40 font-semibold text-destructive hover:bg-destructive/10"
                              onClick={() => void handleArchiveClass(c.id)}
                            >
                              Archive class
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div id="teacher-enrolled-students">
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "12px",
                        marginBottom: "12px",
                      }}
                    >
                      <h3 className="font-heading text-base font-semibold text-[#1B4332]">
                        Enrolled students
                      </h3>
                      {selectedClassId ? (
                        <Button
                          type="button"
                          size="sm"
                          className="bg-[#52B788] font-semibold hover:bg-[#40916C]"
                          onClick={() => setShowBulkUpload(true)}
                        >
                          Bulk add students
                        </Button>
                      ) : null}
                    </div>
                    {studentsError ? (
                      <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                        {studentsError}
                      </div>
                    ) : null}
                    {studentsLoading ? (
                      <div className="rounded-xl border border-dashed border-[#E5E7EB] py-6 text-center text-sm text-muted-foreground">
                        Loading students…
                      </div>
                    ) : enrolledStudents.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-[#E5E7EB] py-6">
                        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
                          <Image
                            src="/images/ui/ui-empty-state.jpg"
                            alt=""
                            width={160}
                            height={160}
                            className="h-auto w-[160px] shrink-0 rounded-md object-cover"
                            priority={false}
                          />
                          <div>
                            <div className="text-base font-extrabold text-[#1A2F23]">No students enrolled yet</div>
                            <div className="mt-1 text-sm font-semibold text-muted-foreground">
                              Share your class code or use bulk add to register students with kid login codes.
                            </div>
                            {selectedClassId ? (
                              <Button
                                type="button"
                                size="sm"
                                className="mt-4 bg-[#52B788] font-semibold hover:bg-[#40916C]"
                                onClick={() => setShowBulkUpload(true)}
                              >
                                Bulk add students
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead className="text-right">Report</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {enrolledStudents.map((s) => (
                            <TableRow key={s.id}>
                              <TableCell className="font-medium">{s.full_name || s.id}</TableCell>
                              <TableCell className="text-muted-foreground">{s.email || "—"}</TableCell>
                              <TableCell className="text-right">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="border-primary/40 font-semibold text-primary hover:bg-primary/10"
                                  onClick={() =>
                                    window.open(`/report/${s.id}`, "_blank", "noopener,noreferrer")
                                  }
                                >
                                  <FileBarChart className="mr-2 h-4 w-4" strokeWidth={2.25} aria-hidden />
                                  Generate Report
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                </div>
              )}
            </section>

            <section id="teacher-leaderboard" style={{ ...SECTION_CARD, ...SCROLL_SECTION }}>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "16px",
                  marginBottom: "20px",
                }}
              >
                <h2 style={{ ...SECTION_H2, marginBottom: 0 }}>Student leaderboard</h2>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  <button
                    type="button"
                    className="text-sm font-bold text-[#1B4332] transition-colors hover:bg-[#F3F4F6]"
                    style={{
                      padding: "8px 16px",
                      borderRadius: "9999px",
                      border: "1px solid #E5E7EB",
                      background: "#FFFFFF",
                      cursor: "pointer",
                    }}
                  >
                    Export report
                  </button>
                  <button
                    type="button"
                    className="text-sm font-bold text-[#1B4332] transition-colors hover:bg-[#F3F4F6]"
                    style={{
                      padding: "8px 16px",
                      borderRadius: "9999px",
                      border: "1px solid #E5E7EB",
                      background: "#FFFFFF",
                      cursor: "pointer",
                    }}
                  >
                    View full leaderboard
                  </button>
                </div>
              </div>

              {leaderboardData.slice(0, 5).map((student) => (
                <div
                  key={student.rank}
                  className="transition-all duration-200 hover:bg-[#E8F5EE]"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "16px",
                    borderRadius: "12px",
                    marginBottom: "8px",
                    background: "#F9FAFB",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", minWidth: 0 }}>
                    <div style={rankCircleStyle(student.rank)}>{student.rank}</div>
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "50%",
                        background: "rgba(82, 183, 136, 0.2)",
                        color: "#1B4332",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "13px",
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {initials(student.name)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p className="truncate text-[15px] font-bold text-[#1B4332]">{student.name}</p>
                      <p style={{ fontSize: "13px", color: "#6B7280" }}>
                        Accuracy {student.accuracy}% · Lessons {student.lessons}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", flexShrink: 0 }}>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontSize: "22px", fontWeight: 700, color: "#1B4332", lineHeight: 1.1 }}>
                        {student.wpm}
                      </p>
                      <p style={{ fontSize: "11px", color: "#6B7280", fontWeight: 600 }}>WPM</p>
                    </div>
                    <div style={{ width: "28px", display: "flex", justifyContent: "center" }}>
                      {student.badge === "trophy" ? (
                        <Trophy className="size-6" style={{ color: "#F59E0B" }} strokeWidth={2.25} aria-label="Trophy" />
                      ) : student.badge === "star" ? (
                        <Star className="size-6" style={{ color: "#6B7280" }} strokeWidth={2.25} aria-label="Star" />
                      ) : student.badge === "leaf" ? (
                        <Leaf className="size-6" style={{ color: "#16A34A" }} strokeWidth={2.25} aria-label="Eco badge" />
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </section>

            <section id="teacher-students" style={{ ...SECTION_CARD, ...SCROLL_SECTION }}>
              <h2 style={SECTION_H2}>All students</h2>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "20px",
                }}
              >
                <input
                  style={{ ...FORM_CONTROL, flex: "1 1 240px", marginBottom: 0, minWidth: "min(100%, 200px)" }}
                  placeholder="Search students by name..."
                  value={searchStudent}
                  onChange={(e) => setSearchStudent(e.target.value)}
                />
                <button
                  type="button"
                  className="text-sm font-bold text-[#1B4332] transition-colors hover:bg-[#F3F4F6]"
                  style={{
                    padding: "8px 16px",
                    borderRadius: "9999px",
                    border: "1px solid #E5E7EB",
                    background: "#FFFFFF",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  Export CSV
                </button>
              </div>

              {pagedStudents.map((student) => (
                <div
                  key={student.id}
                  className="transition-all duration-200 hover:border-[#52B788] hover:shadow-[0_4px_14px_rgba(82,183,136,0.12)]"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "16px 20px",
                    background: "#FFFFFF",
                    border: "1px solid #E5E7EB",
                    borderRadius: "12px",
                    marginBottom: "8px",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <div style={{ minWidth: "140px" }}>
                    <p className="text-[15px] font-bold text-[#1B4332]">{student.name}</p>
                    <p style={{ fontSize: "12px", color: "#6B7280", marginTop: "4px" }}>
                      Last active: {student.lastActive}
                    </p>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px" }}>
                    {[
                      { k: "WPM", v: String(student.wpm) },
                      { k: "Accuracy", v: `${student.accuracy}%` },
                      { k: "Lessons", v: String(student.lessons) },
                    ].map(({ k, v }) => (
                      <span key={k} style={{ fontSize: "13px", color: "#4A6355" }}>
                        <span style={{ color: "#9CA3AF", marginRight: "6px" }}>{k}</span>
                        <strong className="text-[#1B4332]">{v}</strong>
                      </span>
                    ))}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    <button
                      type="button"
                      className="text-xs font-bold text-[#1B4332] transition-colors hover:bg-[#E8F5EE]"
                      style={{
                        padding: "8px 14px",
                        borderRadius: "9999px",
                        border: "1px solid #E5E7EB",
                        background: "#FFFFFF",
                        cursor: "pointer",
                      }}
                      onClick={() => window.open(`/report/${student.id}`, "_blank", "noopener,noreferrer")}
                    >
                      View report
                    </button>
                    <button
                      type="button"
                      className="text-xs font-bold text-[#52B788] transition-colors hover:bg-[#E8F5EE]"
                      style={{
                        padding: "8px 14px",
                        borderRadius: "9999px",
                        border: "1px solid rgba(82, 183, 136, 0.35)",
                        background: "rgba(82, 183, 136, 0.08)",
                        cursor: "pointer",
                      }}
                      onClick={() => showToast("info", "Messaging coming soon — contact via school email.")}
                    >
                      Message
                    </button>
                  </div>
                </div>
              ))}

              <div
                style={{
                  marginTop: "20px",
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                }}
              >
                <span className="text-sm font-semibold text-[#6B7280]">
                  Page {studentPage} of {studentPageCount}
                </span>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    disabled={studentPage <= 1}
                    className="text-sm font-bold text-[#1B4332] transition-colors enabled:hover:bg-[#E8F5EE] disabled:cursor-not-allowed disabled:opacity-40"
                    style={{
                      padding: "8px 16px",
                      borderRadius: "9999px",
                      border: "1px solid #E5E7EB",
                      background: "#FFFFFF",
                      cursor: studentPage <= 1 ? "not-allowed" : "pointer",
                    }}
                    onClick={() => setStudentPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={studentPage >= studentPageCount}
                    className="text-sm font-bold text-[#1B4332] transition-colors enabled:hover:bg-[#E8F5EE] disabled:cursor-not-allowed disabled:opacity-40"
                    style={{
                      padding: "8px 16px",
                      borderRadius: "9999px",
                      border: "1px solid #E5E7EB",
                      background: "#FFFFFF",
                      cursor: studentPage >= studentPageCount ? "not-allowed" : "pointer",
                    }}
                    onClick={() => setStudentPage((p) => Math.min(studentPageCount, p + 1))}
                  >
                    Next
                  </button>
                </div>
              </div>

              {selectedStudent ? (
                <div
                  className="rounded-[20px] border border-[#52B788]/40 bg-[#F0F9F4] p-6"
                  style={{ marginTop: "24px" }}
                >
                  <h3 className="font-heading text-base font-bold text-[#1B4332]">
                    Detailed progress — {filteredStudents.find((s) => s.id === selectedStudent)?.name}
                  </h3>
                  <div
                    className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
                    style={{ marginTop: "16px" }}
                  >
                    {[
                      ["Total WPM", filteredStudents.find((s) => s.id === selectedStudent)?.wpm],
                      ["Accuracy", `${filteredStudents.find((s) => s.id === selectedStudent)?.accuracy}%`],
                      ["Lessons", filteredStudents.find((s) => s.id === selectedStudent)?.lessons],
                      ["Eco actions", "8"],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <p className="text-xs text-[#6B7280]">{k}</p>
                        <p className="font-heading text-2xl font-bold text-[#52B788]">{v}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </section>

            <section id="teacher-lessons" style={{ ...SECTION_CARD, ...SCROLL_SECTION }}>
              <h2 style={SECTION_H2}>Assign a lesson</h2>
              <div style={{ marginBottom: "16px" }}>
                <label htmlFor="lesson-name" style={FORM_LABEL}>
                  Lesson name
                </label>
                <input
                  id="lesson-name"
                  style={FORM_CONTROL}
                  value={lessonName}
                  onChange={(e) => setLessonName(e.target.value)}
                  placeholder="e.g. The water cycle"
                />
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label htmlFor="lesson-body" style={FORM_LABEL}>
                  Lesson text
                </label>
                <textarea
                  id="lesson-body"
                  style={{ ...FORM_CONTROL, minHeight: "120px", resize: "vertical" as const }}
                  value={assignmentText}
                  onChange={(e) => setAssignmentText(e.target.value.slice(0, 1000))}
                  placeholder="Paste passage or facts for students to type…"
                />
                <p className="text-xs text-muted-foreground" style={{ marginTop: "6px" }}>
                  {assignmentText.length}/1000 characters
                </p>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "16px",
                  marginBottom: "8px",
                }}
              >
                <div>
                  <span style={FORM_LABEL}>Difficulty</span>
                  <select style={FORM_CONTROL} value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
                <div>
                  <span style={FORM_LABEL}>Assign to</span>
                  <select style={FORM_CONTROL} value={assignTo} onChange={(e) => setAssignTo(e.target.value)}>
                    <option value="class">Whole class</option>
                    <option value="individual">Specific student</option>
                  </select>
                </div>
                <div>
                  <span style={FORM_LABEL}>Schedule</span>
                  <select style={FORM_CONTROL} value={schedule} onChange={(e) => setSchedule(e.target.value)}>
                    <option value="now">Now</option>
                    <option value="later">Later</option>
                  </select>
                </div>
              </div>
              <button type="button" style={PRIMARY_CTA}>
                Assign lesson
              </button>
            </section>

            <section style={{ ...SECTION_CARD, ...SCROLL_SECTION }}>
              <h2 style={SECTION_H2}>Saved lesson library</h2>
              {savedLessons.map((lesson) => (
                <div
                  key={lesson.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 18px",
                    background: "#F9FAFB",
                    borderRadius: "12px",
                    marginBottom: "8px",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <div>
                    <p className="text-[15px] font-bold text-[#1B4332]">{lesson.name}</p>
                    <p style={{ fontSize: "12px", color: "#6B7280", marginTop: "4px" }}>
                      Created {lesson.createdAt} · Used {lesson.uses}×
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      type="button"
                      style={{
                        padding: "8px 16px",
                        borderRadius: "9999px",
                        border: "none",
                        background: "linear-gradient(135deg, #52B788 0%, #40916C 100%)",
                        color: "#FFFFFF",
                        fontSize: "13px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Reuse
                    </button>
                    <button
                      type="button"
                      className="text-sm font-bold text-red-600 underline-offset-2 hover:underline"
                      style={{ background: "none", border: "none", cursor: "pointer", padding: "8px" }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </section>

            <section id="teacher-eco-feed" style={{ ...SECTION_CARD, ...SCROLL_SECTION }}>
              <h2 style={SECTION_H2}>Recent eco actions</h2>
              {ecoFeedData.map((item) => {
                const EcoIcon = item.Icon;
                return (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "14px 16px",
                      background: "#F0F9F4",
                      borderRadius: "12px",
                      marginBottom: "8px",
                      borderLeft: "4px solid #52B788",
                    }}
                  >
                    <EcoIcon
                      className="shrink-0"
                      style={{ width: "24px", height: "24px", color: "#52B788" }}
                      strokeWidth={2}
                      aria-hidden
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "14px", color: "#1B4332" }}>
                        <strong className="font-bold">{item.studentName}</strong> uploaded: {item.action}
                      </p>
                    </div>
                    <span style={{ fontSize: "12px", color: "#6B7280", flexShrink: 0 }}>{item.time}</span>
                  </div>
                );
              })}
              <button
                type="button"
                className="mt-3 text-sm font-bold text-[#52B788] underline-offset-2 hover:underline"
                style={{ marginTop: "12px", background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                View all
              </button>
            </section>

            <section id="teacher-school" style={{ ...SECTION_CARD, ...SCROLL_SECTION }}>
              <h2 style={SECTION_H2}>School customization</h2>
              <div style={{ marginBottom: "16px" }}>
                <label htmlFor="school-name" style={FORM_LABEL}>
                  School name
                </label>
                <input
                  id="school-name"
                  style={FORM_CONTROL}
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                />
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label htmlFor="teacher-school-logo" style={FORM_LABEL}>
                  School logo (optional)
                </label>
                <input
                  id="teacher-school-logo"
                  type="file"
                  accept="image/*"
                  style={{
                    ...FORM_CONTROL,
                    padding: "10px 14px",
                    cursor: "pointer",
                  }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      setSchoolLogoDataUrl(typeof reader.result === "string" ? reader.result : null);
                    };
                    reader.readAsDataURL(file);
                  }}
                />
                <p className="text-xs text-muted-foreground" style={{ marginTop: "6px" }}>
                  Saved with school name for PDF reports · ~200×200px works well
                </p>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
                  marginBottom: "16px",
                  alignItems: "end",
                }}
                className="max-sm:grid-cols-1"
              >
                <div>
                  <label htmlFor="primary-color" style={FORM_LABEL}>
                    Primary color
                  </label>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                    <input
                      id="primary-color"
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      style={{
                        width: "40px",
                        height: "40px",
                        padding: 0,
                        border: "2px solid #E5E7EB",
                        borderRadius: "10px",
                        cursor: "pointer",
                        background: primaryColor,
                      }}
                      aria-label="Pick primary color"
                    />
                    <span className="font-mono text-sm text-[#4A6355]">{primaryColor}</span>
                  </div>
                </div>
                <div>
                  <span style={{ ...FORM_LABEL, marginBottom: "8px" }}>Preview</span>
                  <button
                    type="button"
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      border: "none",
                      background: primaryColor,
                      color: "#FFFFFF",
                      fontWeight: 700,
                      fontSize: "14px",
                      cursor: "default",
                    }}
                  >
                    Sample button
                  </button>
                </div>
              </div>
              <button
                type="button"
                style={PRIMARY_CTA}
                onClick={() => saveReportBranding({ name: schoolName.trim() || "School", logoDataUrl: schoolLogoDataUrl })}
              >
                Save changes
              </button>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
