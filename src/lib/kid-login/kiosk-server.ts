import type { SupabaseClient } from "@supabase/supabase-js";

const CLASS_CODE_LENGTH = 8;

export type KioskClassInfo = {
  class_id: string;
  class_name: string;
};

export type KioskRosterStudent = {
  student_id: string;
  display_name: string;
  pet_type: "panda" | "turtle" | null;
};

export async function resolveKioskClassByCode(
  admin: SupabaseClient,
  classCodeRaw: string
): Promise<KioskClassInfo> {
  const class_code = classCodeRaw.replace(/\s/g, "").toUpperCase();
  if (class_code.length !== CLASS_CODE_LENGTH) {
    throw new Error("Invalid class code");
  }

  const { data, error } = await admin
    .from("classes")
    .select("id, name")
    .eq("class_code", class_code)
    .is("archived_at", null)
    .maybeSingle();

  if (error || !data) {
    throw new Error("Class not found. Check the code with your teacher.");
  }

  return { class_id: data.id, class_name: data.name };
}

export async function fetchKioskRoster(
  admin: SupabaseClient,
  classId: string
): Promise<{ class_name: string; students: KioskRosterStudent[] }> {
  const { data: classRow, error: classError } = await admin
    .from("classes")
    .select("id, name")
    .eq("id", classId)
    .is("archived_at", null)
    .maybeSingle();

  if (classError || !classRow) {
    throw new Error("Class not found");
  }

  const { data: enrollments, error: enrollError } = await admin
    .from("class_enrollments")
    .select("student_auth_user_id, display_name")
    .eq("class_id", classId)
    .order("display_name", { ascending: true });

  if (enrollError) {
    throw new Error(enrollError.message);
  }

  const rows = enrollments ?? [];
  if (rows.length === 0) {
    return { class_name: classRow.name, students: [] };
  }

  const studentIds = rows.map((r) => r.student_auth_user_id as string);

  const { data: profiles, error: profileError } = await admin
    .from("profiles")
    .select("id, full_name, pet_type")
    .in("id", studentIds);

  if (profileError) {
    throw new Error(profileError.message);
  }

  const profileById = new Map(
    (profiles ?? []).map((p) => [
      p.id as string,
      {
        full_name: (p.full_name as string | null) ?? null,
        pet_type: p.pet_type as string | null,
      },
    ])
  );

  const students: KioskRosterStudent[] = rows.map((row) => {
    const studentId = row.student_auth_user_id as string;
    const profile = profileById.get(studentId);
    const enrollmentName = (row.display_name as string)?.trim() || "";
    const profileName = profile?.full_name?.trim() || "";
    const display_name = enrollmentName || profileName || "Student";

    const rawPet = profile?.pet_type;
    const pet_type =
      rawPet === "panda" || rawPet === "turtle" ? rawPet : null;

    return { student_id: studentId, display_name, pet_type };
  });

  return { class_name: classRow.name, students };
}

export type KioskSignInCredentials = {
  internal_email: string;
  internal_password: string;
};

/** Verifies enrollment, loads child credentials server-side only. */
export async function resolveKioskStudentCredentials(
  admin: SupabaseClient,
  input: { class_id: string; student_auth_user_id: string }
): Promise<KioskSignInCredentials> {
  const { class_id, student_auth_user_id } = input;

  const { data: enrollment, error: enrollError } = await admin
    .from("class_enrollments")
    .select("id")
    .eq("class_id", class_id)
    .eq("student_auth_user_id", student_auth_user_id)
    .maybeSingle();

  if (enrollError || !enrollment) {
    throw new Error("Student not in this class");
  }

  const { data: child, error: childError } = await admin
    .from("children")
    .select("internal_email, internal_password, auth_user_id")
    .eq("auth_user_id", student_auth_user_id)
    .maybeSingle();

  if (
    childError ||
    !child?.internal_email ||
    !child?.internal_password ||
    child.auth_user_id !== student_auth_user_id
  ) {
    throw new Error("Could not sign in this student");
  }

  return {
    internal_email: child.internal_email as string,
    internal_password: child.internal_password as string,
  };
}
