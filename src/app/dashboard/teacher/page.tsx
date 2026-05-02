"use client";

import { useEffect, useMemo, startTransition, useState } from "react";
import { createClient } from "@/lib/supabase/client";
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
import { Separator } from "@/components/ui/separator";

const selectClassName =
  "flex h-8 w-full rounded-lg border border-input bg-background px-2.5 py-1 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export default function TeacherDashboard() {
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [assignmentText, setAssignmentText] = useState("");
  const [lessonName, setLessonName] = useState("");
  const [difficulty, setDifficulty] = useState("Beginner");
  const [assignTo, setAssignTo] = useState("class");
  const [schedule, setSchedule] = useState("now");
  const [searchStudent, setSearchStudent] = useState("");
  const [schoolName, setSchoolName] = useState("Green Valley Primary School");
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
    { rank: 1, name: "Sarah Ahmed", wpm: 42, accuracy: 96, lessons: 28, streak: 7, badge: "🏆" },
    { rank: 2, name: "Omar Khan", wpm: 38, accuracy: 94, lessons: 25, streak: 5, badge: "⭐" },
    { rank: 3, name: "Fatima Ali", wpm: 35, accuracy: 91, lessons: 22, streak: 4, badge: "🌿" },
    { rank: 4, name: "Zahra Hassan", wpm: 33, accuracy: 90, lessons: 20, streak: 3, badge: "" },
    { rank: 5, name: "Amir Ibrahim", wpm: 31, accuracy: 88, lessons: 19, streak: 2, badge: "" },
    { rank: 6, name: "Noor Rashid", wpm: 29, accuracy: 87, lessons: 18, streak: 2, badge: "" },
    { rank: 7, name: "Hana Karim", wpm: 28, accuracy: 86, lessons: 17, streak: 1, badge: "" },
    { rank: 8, name: "Karim Saleh", wpm: 26, accuracy: 84, lessons: 16, streak: 1, badge: "" },
    { rank: 9, name: "Layla Ahmed", wpm: 25, accuracy: 83, lessons: 15, streak: 0, badge: "" },
    { rank: 10, name: "Hassan Ali", wpm: 24, accuracy: 82, lessons: 14, streak: 0, badge: "" },
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
    { id: 1, studentName: "Sarah", action: "Watering plants", icon: "💧", time: "2 hours ago" },
    { id: 2, studentName: "Omar", action: "Planted a tree", icon: "🌱", time: "Yesterday" },
    { id: 3, studentName: "Fatima", action: "Water for birds", icon: "🐦", time: "2 days ago" },
    { id: 4, studentName: "Zahra", action: "Recycling bin sort", icon: "♻️", time: "3 days ago" },
    { id: 5, studentName: "Amir", action: "Composting", icon: "🌿", time: "4 days ago" },
  ];

  const savedLessons = [
    { id: 1, name: "The Water Cycle", createdAt: "Mar 15", uses: 3 },
    { id: 2, name: "Solar Energy Facts", createdAt: "Mar 10", uses: 5 },
    { id: 3, name: "Biodiversity Story", createdAt: "Feb 28", uses: 2 },
  ];

  const filteredStudents = allStudentsData.filter((s) =>
    s.name.toLowerCase().includes(searchStudent.toLowerCase())
  );

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

      <header className="sticky top-0 z-40 border-b border-primary/20 bg-[var(--mgk-dark)]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="font-heading text-xl font-bold text-primary">🌿 My Green Keys</div>
            <Separator orientation="vertical" className="hidden h-8 bg-white/20 md:block" />
            <div>
              <h1 className="font-heading text-lg font-semibold text-white">Teacher Dashboard</h1>
              <p className="text-sm text-white/70">Welcome back, Ms. Ahmed 👋</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="hidden text-right md:block">
              <p className="text-sm font-semibold text-white">{schoolName}</p>
              <p className="text-xs text-primary">School profile</p>
            </div>
            <Button variant="secondary" size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-10 px-6 py-8">
        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-heading text-xl font-bold text-foreground">Classes</h2>
            <Button
              size="sm"
              onClick={() => {
                setCreateClassError("");
                setShowCreateClass(true);
              }}
            >
              Create class
            </Button>
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
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {enrolledStudents.map((s) => (
                          <TableRow key={s.id}>
                            <TableCell className="font-medium">{s.full_name || s.id}</TableCell>
                            <TableCell className="text-muted-foreground">{s.email || "—"}</TableCell>
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

        <section>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: "👥", label: "Total students", value: "48" },
              { icon: "📚", label: "Lessons completed today", value: "127" },
              { icon: "⚡", label: "Class average WPM", value: "28" },
              { icon: "🌿", label: "Eco actions this week", value: "12" },
            ].map((card) => (
              <Card key={card.label}>
                <CardHeader className="pb-2">
                  <div className="text-2xl">{card.icon}</div>
                  <CardDescription>{card.label}</CardDescription>
                  <CardTitle className="font-heading text-3xl">{card.value}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-heading mb-4 text-xl font-bold">Class leaderboard</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>WPM</TableHead>
                <TableHead>Accuracy</TableHead>
                <TableHead>Lessons</TableHead>
                <TableHead>Streak</TableHead>
                <TableHead>Badge</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboardData.map((student) => (
                <TableRow
                  key={student.rank}
                  className={cn(student.rank <= 3 && "bg-primary/5")}
                >
                  <TableCell className="font-semibold">
                    {student.rank === 1 ? "🥇" : student.rank === 2 ? "🥈" : student.rank === 3 ? "🥉" : student.rank}
                  </TableCell>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell className="font-semibold text-primary">{student.wpm} WPM</TableCell>
                  <TableCell>{student.accuracy}%</TableCell>
                  <TableCell>{student.lessons}</TableCell>
                  <TableCell>{student.streak > 0 ? `🔥${student.streak}` : "—"}</TableCell>
                  <TableCell className="text-lg">{student.badge}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>

        <section>
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
                <TableHead>Gender</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>WPM</TableHead>
                <TableHead>Accuracy</TableHead>
                <TableHead>Lessons</TableHead>
                <TableHead>Last active</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow
                  key={student.id}
                  className="cursor-pointer"
                  onClick={() => setSelectedStudent(selectedStudent === student.id ? null : student.id)}
                >
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>{student.gender}</TableCell>
                  <TableCell>{student.age}</TableCell>
                  <TableCell className="font-semibold text-primary">{student.wpm}</TableCell>
                  <TableCell>{student.accuracy}%</TableCell>
                  <TableCell>{student.lessons}</TableCell>
                  <TableCell className="text-muted-foreground">{student.lastActive}</TableCell>
                  <TableCell>{statusBadge(student.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {selectedStudent ? (
            <Card className="mt-4 border-primary/40">
              <CardHeader>
                <CardTitle className="font-heading text-base">
                  Detailed progress — {filteredStudents.find((s) => s.id === selectedStudent)?.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

        <section>
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
              <div className="grid gap-4 md:grid-cols-3">
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

        <section>
          <h2 className="font-heading mb-4 text-xl font-bold">Recent eco actions</h2>
          <div className="space-y-3">
            {ecoFeedData.map((item) => (
              <Card key={item.id} className="border-primary/25 bg-primary/5">
                <CardContent className="py-4">
                  <p className="font-medium">
                    {item.studentName} uploaded: {item.action} {item.icon}
                  </p>
                  <p className="text-sm text-muted-foreground">— {item.time}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Button variant="outline" className="mt-4 border-primary text-primary hover:bg-primary/10">
            View all
          </Button>
        </section>

        <section>
          <h2 className="font-heading mb-4 text-xl font-bold">School customization</h2>
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="school-name">School name</Label>
                <Input id="school-name" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>School logo</Label>
                <Button variant="secondary">Upload logo</Button>
                <p className="text-xs text-muted-foreground">Placeholder · 200×200px recommended</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
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
              <Button className="w-full" size="lg">
                Save changes
              </Button>
            </CardContent>
          </Card>
        </section>

        <section className="pb-16">
          <h2 className="font-heading mb-4 text-xl font-bold">Generate reports</h2>
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="grid gap-4 md:grid-cols-2">
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
  );
}
