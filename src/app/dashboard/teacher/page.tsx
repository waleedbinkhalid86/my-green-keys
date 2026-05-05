"use client";

import { useEffect, useMemo, startTransition, useState } from "react";
import {
  Activity,
  Bird,
  BookOpen,
  Copy,
  Droplets,
  FileBarChart,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Leaf,
  LogOut,
  Recycle,
  Settings,
  Sparkles,
  Sprout,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { loadReportBranding, saveReportBranding } from "@/lib/report/branding";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TEACHER_SIDEBAR = [
  { href: "#teacher-overview", label: "Overview", Icon: LayoutDashboard },
  { href: "#teacher-classes", label: "My Classes", Icon: GraduationCap },
  { href: "#teacher-students", label: "Students", Icon: Users },
  { href: "#teacher-leaderboard", label: "Leaderboard", Icon: Trophy },
  { href: "#teacher-lessons", label: "Custom Lessons", Icon: BookOpen },
  { href: "#teacher-reports", label: "Reports", Icon: FileText },
  { href: "#teacher-school", label: "School Settings", Icon: Settings },
] as const;

const selectClassName =
  "flex h-8 w-full rounded-lg border border-input bg-background px-2.5 py-1 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

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

  const [teacherId, setTeacherId] = useState<string>("");
  const [classesLoading, setClassesLoading] = useState(true);
  const [classesError, setClassesError] = useState("");
  const [classes, setClasses] = useState<Array<{ id: string; name: string; code: string }>>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [showCreateClass, setShowCreateClass] = useState(false);
  const [createClassName, setCreateClassName] = useState("");
  const [createClassLoading, setCreateClassLoading] = useState(false);
  const [createClassError, setCreateClassError] = useState("");
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState("");
  const [enrolledStudents, setEnrolledStudents] = useState<
    Array<{ id: string; full_name: string | null; email: string | null }>
  >([]);

  const generateClassCode = useMemo(() => {
    const alphabet = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
    return () => {
      const suffix = Array.from({ length: 3 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join(
        ""
      );
      return `GRN${suffix}`;
    };
  }, []);

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
        setTeacherId("");
        setSelectedClassId("");
        setClassesError("You must be logged in to view classes.");
        return;
      }
      setTeacherId(userData.user.id);

      const { data, error } = await supabase
        .from("classes")
        .select("id, name, code")
        .eq("teacher_id", userData.user.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      const list = (data as Array<{ id: string; name: string; code: string }> | null) ?? [];
      setClasses(list);
      if (list.length > 0) {
        setSelectedClassId((prev) => prev || list[0].id);
      } else {
        setSelectedClassId("");
      }
    } catch (err) {
      setClassesError(err instanceof Error ? err.message : "Failed to load classes.");
      setClasses([]);
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
      const supabase = createClient();
      const { data: enrollments, error: enrollErr } = await supabase
        .from("class_enrollments")
        .select("student_id")
        .eq("class_id", classId);
      if (enrollErr) throw enrollErr;
      const studentIds = ((enrollments as Array<{ student_id: string }> | null) ?? []).map((e) => e.student_id);
      if (studentIds.length === 0) {
        setEnrolledStudents([]);
        return;
      }

      const { data: profiles, error: profilesErr } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", studentIds);
      if (profilesErr) throw profilesErr;
      setEnrolledStudents((profiles as Array<{ id: string; full_name: string | null; email: string | null }> | null) ?? []);
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

      const supabase = createClient();

      let lastErr: unknown = null;
      for (let attempt = 0; attempt < 5; attempt++) {
        const code = generateClassCode();
        const { error } = await supabase.from("classes").insert([
          {
            teacher_id: teacherId,
            name: createClassName.trim(),
            code,
            school_id: null,
          },
        ]);

        if (!error) {
          setShowCreateClass(false);
          setCreateClassName("");
          await loadClasses();
          return;
        }

        lastErr = error;
        if (!String((error as { message?: string }).message || "").toLowerCase().includes("duplicate")) {
          break;
        }
      }

      throw lastErr ?? new Error("Failed to create class.");
    } catch (err) {
      setCreateClassError(err instanceof Error ? err.message : "Failed to create class.");
    } finally {
      setCreateClassLoading(false);
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="border-primary/30 bg-primary/10 font-semibold text-primary hover:bg-primary/15">
            Active
          </Badge>
        );
      case "needs-attention":
        return (
          <Badge variant="outline" className="border-amber-300 bg-amber-50 font-semibold text-amber-900">
            Needs attention
          </Badge>
        );
      case "inactive":
        return (
          <Badge variant="outline" className="border-destructive/40 bg-destructive/10 font-semibold text-destructive">
            Inactive
          </Badge>
        );
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans">
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
            <DialogDescription>Generates a 6-character class code (example: GRN42X).</DialogDescription>
          </DialogHeader>
          {createClassError ? (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
              {createClassError}
            </div>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="create-class-name">Class name</Label>
            <Input
              id="create-class-name"
              value={createClassName}
              onChange={(e) => setCreateClassName(e.target.value)}
              placeholder="e.g. Grade 4A"
              disabled={createClassLoading}
            />
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

      <div className="flex min-h-screen bg-[#FAFAFA] font-sans">
        <aside
          className="sticky top-0 hidden h-screen w-[240px] shrink-0 flex-col border-r border-[#E5E7EB] bg-white py-8 pl-5 pr-3 lg:flex"
          aria-label="Teacher navigation"
        >
            <div className="mb-8 flex items-center gap-3 px-2">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#2ECC71] text-white">
              <Leaf className="h-6 w-6" strokeWidth={2.25} aria-hidden />
            </div>
            <div>
              <p className="font-heading text-sm font-extrabold text-[#1A2F23]">My Green Keys</p>
              <p className="text-xs font-semibold text-[#64748b]">Teacher</p>
            </div>
          </div>
          <nav className="flex flex-col gap-1">
            {TEACHER_SIDEBAR.map((item) => {
              const active = hash === item.href;
              const Icon = item.Icon;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all duration-200 ease-in-out",
                    active ? "bg-[#2ECC71]/12 text-[#15803d]" : "text-[#374151] hover:bg-[#FAFAFA]"
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
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-[#64748b] transition-colors hover:bg-red-50 hover:text-red-700"
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

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-[#E5E7EB] bg-white/95 px-6 py-4 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="font-heading text-lg font-extrabold text-[#1A2F23] sm:text-xl">Teacher Dashboard</h1>
                <p className="text-sm font-semibold text-[#64748b]">
                  {schoolName} ·{" "}
                  {new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
                </p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-full bg-[#2ECC71]/20 text-sm font-extrabold text-[#15803d]" aria-hidden>
                A
              </div>
            </div>
          </header>

          <div className="mgk-container space-y-10 py-8">
        <section id="teacher-overview" className="scroll-mt-24">
          <div className="mgk-grid md:grid-cols-2 lg:grid-cols-4">
            {(
              [
                { Icon: Users, label: "Total Students", value: "48" },
                { Icon: Activity, label: "Active Today", value: "32" },
                { Icon: Zap, label: "Class Average WPM", value: "28" },
                { Icon: BookOpen, label: "Lessons Completed Today", value: "127" },
              ] as const
            ).map((card) => {
              const StatIcon = card.Icon;
              return (
              <Card key={card.label}>
                <CardHeader className="pb-2">
                  <StatIcon className="h-8 w-8 text-green-600" strokeWidth={2.25} aria-hidden />
                  <CardDescription className="font-semibold">{card.label}</CardDescription>
                  <CardTitle className="font-heading text-3xl text-[#2ECC71]">{card.value}</CardTitle>
                </CardHeader>
              </Card>
            );
            })}
          </div>
        </section>

        <section id="teacher-classes" className="scroll-mt-24">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-heading text-xl font-bold text-foreground">Class overview</h2>
              {activeClass ? (
                <p className="mt-1 text-sm font-semibold text-muted-foreground">
                  <span className="font-mono font-bold text-[#1A2F23]">{activeClass.name}</span>
                  <span className="mx-2 text-[#CBD5E1]">·</span>
                  Code{" "}
                  <span className="font-mono font-extrabold tracking-widest text-[#2ECC71]">{activeClass.code}</span>
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              {activeClass ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="rounded-[50px] border-[#2ECC71]/40 font-bold"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(activeClass.code);
                      showToast("success", "Class code copied!");
                    } catch {
                      showToast("error", "Could not copy code.");
                    }
                  }}
                >
                  <Copy className="mr-2 size-4" strokeWidth={2.5} />
                  Copy code
                </Button>
              ) : null}
              <Button
                size="sm"
                className="rounded-[50px] bg-[#2ECC71] font-bold hover:bg-[#27ae60]"
                onClick={() => {
                  setCreateClassError("");
                  setShowCreateClass(true);
                }}
              >
                Create New Class
              </Button>
            </div>
          </div>

          {classesError ? (
            <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {classesError}
            </div>
          ) : null}

          {classesLoading ? (
            <Card>
              <CardContent className="py-8 text-muted-foreground">Loading classes…</CardContent>
            </Card>
          ) : classes.length === 0 ? (
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="font-heading text-base">No classes yet</CardTitle>
                <CardDescription>Create a class to generate a code students can use to join.</CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <Card>
              <CardContent className="space-y-6 pt-6">
                <Tabs value={selectedClassId} onValueChange={setSelectedClassId}>
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <TabsList variant="line" className="h-auto min-h-9 flex-wrap justify-start">
                      {classes.map((c) => (
                        <TabsTrigger key={c.id} value={c.id}>
                          {c.name}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    <div className="text-left md:text-right">
                      <p className="text-xs font-medium text-muted-foreground">Class code</p>
                      <p className="font-mono text-xl font-bold tracking-widest text-primary">
                        {classes.find((c) => c.id === selectedClassId)?.code ?? "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">Students join with this code on the Lesson page.</p>
                    </div>
                  </div>
                  {classes.map((c) => (
                    <TabsContent key={c.id} value={c.id} className="sr-only">
                      {c.name}
                    </TabsContent>
                  ))}
                </Tabs>

                <div>
                  <h3 className="font-heading mb-3 text-base font-semibold">Enrolled students</h3>
                  {studentsError ? (
                    <div className="mb-3 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                      {studentsError}
                    </div>
                  ) : null}
                  {studentsLoading ? (
                    <Card className="border-dashed">
                      <CardContent className="py-6 text-sm text-muted-foreground">Loading students…</CardContent>
                    </Card>
                  ) : enrolledStudents.length === 0 ? (
                    <Card className="border-dashed">
                      <CardContent className="py-6 text-sm text-muted-foreground">No students enrolled yet.</CardContent>
                    </Card>
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
              </CardContent>
            </Card>
          )}
        </section>

        <section id="teacher-leaderboard" className="scroll-mt-24">
          <h2 className="font-heading mb-4 text-xl font-bold">Student leaderboard</h2>
          <Card className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Avatar</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>WPM</TableHead>
                  <TableHead>Lessons</TableHead>
                  <TableHead>Eco Points</TableHead>
                  <TableHead>Badge</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboardData.map((student) => (
                  <TableRow
                    key={student.rank}
                    className={cn(student.rank <= 3 && "bg-primary/5")}
                  >
                    <TableCell className="font-semibold">{student.rank}</TableCell>
                    <TableCell>
                      <div className="flex size-9 items-center justify-center rounded-full bg-[#2ECC71]/20 text-xs font-extrabold text-[#15803d]">
                        {initials(student.name)}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell className="font-semibold text-primary">{student.wpm}</TableCell>
                    <TableCell>{student.lessons}</TableCell>
                    <TableCell className="font-semibold text-[#15803d]">{student.ecoPoints}</TableCell>
                    <TableCell className="text-lg">
                      {student.badge === "trophy" ? (
                        <Trophy className="h-5 w-5 text-amber-600" strokeWidth={2.25} aria-label="Trophy" />
                      ) : student.badge === "star" ? (
                        <Sparkles className="h-5 w-5 text-amber-500" strokeWidth={2.25} aria-label="Star" />
                      ) : student.badge === "leaf" ? (
                        <Leaf className="h-5 w-5 text-green-600" strokeWidth={2.25} aria-label="Eco badge" />
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </section>

        <section id="teacher-students" className="scroll-mt-24">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-heading text-xl font-bold">All students</h2>
            <Button variant="outline" size="sm">
              Export CSV
            </Button>
          </div>
          <Input
            className="mb-4 max-w-md"
            placeholder="Search students by name…"
            value={searchStudent}
            onChange={(e) => setSearchStudent(e.target.value)}
          />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>WPM</TableHead>
                <TableHead>Accuracy</TableHead>
                <TableHead>Lessons</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedStudents.map((student) => (
                <TableRow
                  key={student.id}
                  className="cursor-pointer"
                  onClick={() => setSelectedStudent(selectedStudent === student.id ? null : student.id)}
                >
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell className="font-semibold text-primary">{student.wpm}</TableCell>
                  <TableCell>{student.accuracy}%</TableCell>
                  <TableCell>{student.lessons}</TableCell>
                  <TableCell className="text-muted-foreground">{student.lastActive}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-wrap justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="border-[#2ECC71]/40 font-semibold text-[#15803d]"
                        onClick={() => window.open(`/report/${student.id}`, "_blank", "noopener,noreferrer")}
                      >
                        View Report
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => showToast("info", "Messaging coming soon — contact via school email.")}
                      >
                        Send Message
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm font-semibold text-muted-foreground">
            <span>
              Page {studentPage} of {studentPageCount}
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={studentPage <= 1}
                onClick={() => setStudentPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={studentPage >= studentPageCount}
                onClick={() => setStudentPage((p) => Math.min(studentPageCount, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>

          {selectedStudent ? (
            <Card className="mt-4 border-primary/40">
              <CardHeader>
                <CardTitle className="font-heading text-base">
                  Detailed progress — {filteredStudents.find((s) => s.id === selectedStudent)?.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="mgk-grid sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["Total WPM", filteredStudents.find((s) => s.id === selectedStudent)?.wpm],
                  ["Accuracy", `${filteredStudents.find((s) => s.id === selectedStudent)?.accuracy}%`],
                  ["Lessons", filteredStudents.find((s) => s.id === selectedStudent)?.lessons],
                  ["Eco actions", "8"],
                ].map(([k, v]) => (
                  <div key={k}>
                    <p className="text-xs text-muted-foreground">{k}</p>
                    <p className="font-heading text-2xl font-bold text-primary">{v}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}
        </section>

        <section id="teacher-lessons" className="scroll-mt-24">
          <h2 className="font-heading mb-4 text-xl font-bold">Assign a lesson</h2>
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="lesson-name">Lesson name</Label>
                <Input
                  id="lesson-name"
                  value={lessonName}
                  onChange={(e) => setLessonName(e.target.value)}
                  placeholder="e.g. The water cycle"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lesson-body">Lesson text</Label>
                <Textarea
                  id="lesson-body"
                  value={assignmentText}
                  onChange={(e) => setAssignmentText(e.target.value.slice(0, 1000))}
                  rows={6}
                  placeholder="Paste passage or facts for students to type…"
                />
                <p className="text-xs text-muted-foreground">{assignmentText.length}/1000 characters</p>
              </div>
              <div className="mgk-grid md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <select className={selectClassName} value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Assign to</Label>
                  <select className={selectClassName} value={assignTo} onChange={(e) => setAssignTo(e.target.value)}>
                    <option value="class">Whole class</option>
                    <option value="individual">Individual student</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Schedule</Label>
                  <select className={selectClassName} value={schedule} onChange={(e) => setSchedule(e.target.value)}>
                    <option value="now">Now</option>
                    <option value="tomorrow">Tomorrow</option>
                    <option value="pick">Pick date</option>
                  </select>
                </div>
              </div>
              <Button className="w-full" size="lg">
                Assign lesson
              </Button>
            </CardContent>
          </Card>

          {savedLessons.length > 0 ? (
            <div className="mt-6 space-y-3">
              <h3 className="font-heading text-base font-semibold">Saved lesson library</h3>
              {savedLessons.map((lesson) => (
                <Card key={lesson.id}>
                  <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                    <div>
                      <p className="font-medium">{lesson.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Created {lesson.createdAt} · Used {lesson.uses}×
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary">
                        Reuse
                      </Button>
                      <Button size="sm" variant="destructive">
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : null}
        </section>

        <section id="teacher-eco-feed" className="scroll-mt-24">
          <h2 className="font-heading mb-4 text-xl font-bold">Recent eco actions</h2>
          <div className="space-y-3">
            {ecoFeedData.map((item) => {
              const EcoIcon = item.Icon;
              return (
              <Card key={item.id} className="border-primary/25 bg-primary/5">
                <CardContent className="py-4">
                  <p className="flex flex-wrap items-center gap-2 font-medium">
                    <EcoIcon className="h-5 w-5 shrink-0 text-green-700" strokeWidth={2} aria-hidden />
                    <span>
                      {item.studentName} uploaded: {item.action}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground">— {item.time}</p>
                </CardContent>
              </Card>
            );
            })}
          </div>
          <Button variant="outline" className="mt-4 border-primary text-primary hover:bg-primary/10">
            View all
          </Button>
        </section>

        <section id="teacher-school" className="scroll-mt-24">
          <h2 className="font-heading mb-4 text-xl font-bold">School customization</h2>
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="school-name">School name</Label>
                <Input id="school-name" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teacher-school-logo">School logo (optional)</Label>
                <Input
                  id="teacher-school-logo"
                  type="file"
                  accept="image/*"
                  className="cursor-pointer text-sm"
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
                <p className="text-xs text-muted-foreground">Saved with school name for PDF reports · ~200×200px works well</p>
              </div>
              <div className="mgk-grid md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="primary-color">Primary color</Label>
                  <div className="flex items-center gap-3">
                    <input
                      id="primary-color"
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="h-10 w-20 cursor-pointer rounded border border-input"
                    />
                    <span className="font-mono text-sm text-muted-foreground">{primaryColor}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Preview</p>
                  <div className="h-10 w-full rounded-md border" style={{ backgroundColor: primaryColor }} />
                </div>
              </div>
              <Button
                type="button"
                className="w-full"
                size="lg"
                onClick={() => saveReportBranding({ name: schoolName.trim() || "School", logoDataUrl: schoolLogoDataUrl })}
              >
                Save changes
              </Button>
            </CardContent>
          </Card>
        </section>

        <section id="teacher-reports" className="scroll-mt-24 pb-16">
          <h2 className="font-heading mb-4 text-xl font-bold">Generate reports</h2>
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="mgk-grid md:grid-cols-2">
                <Button className="w-full" variant="secondary">
                  Generate class report
                </Button>
                <div className="space-y-2">
                  <Label>Individual student report</Label>
                  <select className={selectClassName}>
                    <option>Select a student…</option>
                    {allStudentsData.map((student) => (
                      <option key={student.id}>{student.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                <input type="checkbox" className="size-4 rounded border-input accent-primary" />
                Send to school admin
              </label>
              <Button className="w-full" size="lg">
                Download PDF
              </Button>
            </CardContent>
          </Card>
        </section>
          </div>
        </div>
      </div>
    </div>
  );
}
