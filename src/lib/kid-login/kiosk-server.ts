import type { SupabaseClient } from "@supabase/supabase-js";
import {
  kioskRosterId,
  verifyKioskTokenSignature,
} from "@/lib/kid-login/kiosk-token";

export type KioskRosterStudent = {
  /** Opaque per-roster id; never the raw auth user id. */
  rid: string;
  display_name: string;
  pet_type: "panda" | "turtle" | null;
};

export type KioskDevice = {
  classId: string;
  className: string;
  version: number;
  jti: string;
};

export class KioskLookupError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "KioskLookupError";
  }
}

/** Loads a class's current kiosk version. Throws KioskLookupError on DB errors (e.g. missing migration). */
export async function fetchKioskClass(
  admin: SupabaseClient,
  classId: string
): Promise<{ id: string; name: string; kiosk_token_version: number } | null> {
  const { data, error } = await admin
    .from("classes")
    .select("id, name, kiosk_token_version")
    .eq("id", classId)
    .is("archived_at", null)
    .maybeSingle();

  if (error) {
    throw new KioskLookupError(error.message);
  }
  if (!data || typeof data.kiosk_token_version !== "number") return null;
  return {
    id: data.id as string,
    name: data.name as string,
    kiosk_token_version: data.kiosk_token_version,
  };
}

/** Full device check: signature, expiry, class not archived, version not revoked. */
export async function resolveKioskDevice(
  admin: SupabaseClient,
  secret: string,
  token: string | undefined | null
): Promise<KioskDevice | null> {
  const payload = verifyKioskTokenSignature(secret, token);
  if (!payload) return null;

  const classRow = await fetchKioskClass(admin, payload.cid);
  if (!classRow || classRow.kiosk_token_version !== payload.kv) return null;

  return {
    classId: classRow.id,
    className: classRow.name,
    version: classRow.kiosk_token_version,
    jti: payload.jti,
  };
}

type EnrolledStudent = {
  studentAuthUserId: string;
  enrollmentName: string;
};

async function fetchEnrolledStudents(
  admin: SupabaseClient,
  classId: string
): Promise<EnrolledStudent[]> {
  const { data, error } = await admin
    .from("class_enrollments")
    .select("student_auth_user_id, display_name")
    .eq("class_id", classId)
    .order("display_name", { ascending: true });

  if (error) {
    throw new KioskLookupError(error.message);
  }

  return (data ?? []).map((row) => ({
    studentAuthUserId: row.student_auth_user_id as string,
    enrollmentName: ((row.display_name as string | null) ?? "").trim(),
  }));
}

export async function fetchKioskRoster(
  admin: SupabaseClient,
  secret: string,
  device: KioskDevice
): Promise<{ class_name: string; students: KioskRosterStudent[] }> {
  const rows = await fetchEnrolledStudents(admin, device.classId);
  if (rows.length === 0) {
    return { class_name: device.className, students: [] };
  }

  const { data: profiles, error: profileError } = await admin
    .from("profiles")
    .select("id, full_name, pet_type")
    .in(
      "id",
      rows.map((r) => r.studentAuthUserId)
    );

  if (profileError) {
    throw new KioskLookupError(profileError.message);
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
    const profile = profileById.get(row.studentAuthUserId);
    const profileName = profile?.full_name?.trim() || "";
    const display_name = row.enrollmentName || profileName || "Student";

    const rawPet = profile?.pet_type;
    const pet_type =
      rawPet === "panda" || rawPet === "turtle" ? rawPet : null;

    return {
      rid: kioskRosterId(secret, {
        classId: device.classId,
        version: device.version,
        studentAuthUserId: row.studentAuthUserId,
      }),
      display_name,
      pet_type,
    };
  });

  return { class_name: device.className, students };
}

export type KioskStudentCredentials = {
  login_code: string;
  internal_email: string;
  internal_password: string;
};

/** Maps an opaque roster id back to an enrolled child's credentials. Server-side only. */
export async function resolveKioskStudentByRosterId(
  admin: SupabaseClient,
  secret: string,
  device: KioskDevice,
  rid: string
): Promise<KioskStudentCredentials | null> {
  const rows = await fetchEnrolledStudents(admin, device.classId);
  const match = rows.find(
    (row) =>
      kioskRosterId(secret, {
        classId: device.classId,
        version: device.version,
        studentAuthUserId: row.studentAuthUserId,
      }) === rid
  );
  if (!match) return null;

  const { data: child, error } = await admin
    .from("children")
    .select("auth_user_id, login_code, internal_email, internal_password")
    .eq("auth_user_id", match.studentAuthUserId)
    .maybeSingle();

  if (error) {
    throw new KioskLookupError(error.message);
  }
  if (
    !child?.login_code ||
    !child.internal_email ||
    !child.internal_password ||
    child.auth_user_id !== match.studentAuthUserId
  ) {
    return null;
  }

  return {
    login_code: child.login_code as string,
    internal_email: child.internal_email as string,
    internal_password: child.internal_password as string,
  };
}
