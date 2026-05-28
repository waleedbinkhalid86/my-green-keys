import { createClient } from "@/lib/supabase/client";
import type { ClassEnrollment, SchoolClass } from "./types";
import { generateUniqueClassCode } from "./code-generator";

// Teacher creates a class
export async function createClass(input: {
  name: string;
  school_name?: string;
  grade_level?: string;
}): Promise<SchoolClass> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const class_code = await generateUniqueClassCode();

  const { data, error } = await supabase
    .from("classes")
    .insert({
      teacher_id: user.id,
      name: input.name,
      class_code: class_code,
      school_name: input.school_name ?? null,
      grade_level: input.grade_level ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as SchoolClass;
}

// Teacher fetches their classes
export async function fetchMyClasses(): Promise<SchoolClass[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("classes")
    .select("*")
    .eq("teacher_id", user.id)
    .is("archived_at", null)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as SchoolClass[]) || [];
}

export async function fetchClassEnrollments(classId: string): Promise<ClassEnrollment[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("class_enrollments")
    .select("*")
    .eq("class_id", classId)
    .order("joined_at", { ascending: false });
  if (error) throw error;
  return (data as ClassEnrollment[]) || [];
}

/** Count enrollments per class id (for teacher dashboard). */
export async function fetchEnrollmentCountsByClassIds(
  classIds: string[]
): Promise<Record<string, number>> {
  if (classIds.length === 0) return {};
  const supabase = createClient();
  const { data, error } = await supabase
    .from("class_enrollments")
    .select("class_id")
    .in("class_id", classIds);
  if (error) throw error;
  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    const id = row.class_id as string;
    counts[id] = (counts[id] ?? 0) + 1;
  }
  return counts;
}

type JoinClassApiResponse = {
  class_id: string;
  auth_user_id: string;
  internal_email: string;
  internal_password: string;
  error?: string;
};

// Student joins class with code + their name (PUBLIC, no auth needed)
// This is called from the /kid-login page
export async function joinClassWithCode(input: {
  class_code: string;
  display_name: string;
}): Promise<{ class_id: string; auth_user_id: string }> {
  const supabase = createClient();

  const res = await fetch("/api/kid-login/join-class", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      class_code: input.class_code,
      display_name: input.display_name,
    }),
  });

  const data = (await res.json()) as JoinClassApiResponse;

  if (!res.ok) {
    throw new Error(data.error ?? "Couldn't enroll you in the class. Try again.");
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: data.internal_email,
    password: data.internal_password,
  });

  if (signInError) {
    throw new Error(
      "Account created but sign-in failed. Ask your teacher for your 6-character login code."
    );
  }

  return {
    class_id: data.class_id,
    auth_user_id: data.auth_user_id,
  };
}

// Archive a class (teacher only)
export async function archiveClass(classId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("classes")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", classId);
  if (error) throw error;
}
