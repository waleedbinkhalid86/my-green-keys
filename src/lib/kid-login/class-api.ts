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

// Student joins class with code + their name (PUBLIC, no auth needed)
// This is called from the /kid-login page
export async function joinClassWithCode(input: {
  class_code: string;
  display_name: string;
}): Promise<{ class_id: string; auth_user_id: string }> {
  const supabase = createClient();

  // Step 1: Look up class by code
  const { data: classData, error: classError } = await supabase
    .from("classes")
    .select("id, school_name")
    .eq("class_code", input.class_code.toUpperCase())
    .is("archived_at", null)
    .maybeSingle();

  if (classError || !classData) {
    throw new Error("Class not found. Check the code with your teacher.");
  }

  // Step 2: Create student account (no parent session to preserve here — kid is logging in fresh)
  const internal_email = `child-${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}@mygreenkeys.kids`;
  const internal_password = (crypto.randomUUID() + crypto.randomUUID()).replace(/-/g, "").slice(0, 32);

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: internal_email,
    password: internal_password,
    options: {
      data: {
        is_internal_kid_account: true,
        display_name: input.display_name,
        joined_via: "class_code",
      },
    },
  });

  if (signUpError || !signUpData.user) {
    throw new Error("Failed to create your account: " + (signUpError?.message ?? ""));
  }

  const { error: profileError } = await supabase.from("profiles").insert({
    id: signUpData.user.id,
    full_name: input.display_name,
    email: internal_email,
    account_type: "student",
    school_name: classData.school_name,
    eco_points: 0,
  });

  if (profileError) {
    throw new Error("Failed to create your profile: " + profileError.message);
  }

  // Step 3: Create enrollment
  const { error: enrollError } = await supabase.from("class_enrollments").insert({
    class_id: classData.id,
    student_auth_user_id: signUpData.user.id,
    display_name: input.display_name,
  });

  if (enrollError) {
    console.error("[ClassJoin] enrollment failed:", enrollError);
    throw new Error("Couldn't enroll you in the class. Try again.");
  }

  return {
    class_id: classData.id,
    auth_user_id: signUpData.user.id,
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
