import { createClient } from "@/lib/supabase/client";

function generateInternalEmail(): string {
  const random = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  return `child-${random}@mygreenkeys.kids`;
}

function generateInternalPassword(): string {
  const random = crypto.randomUUID() + crypto.randomUUID();
  return random.replace(/-/g, "").slice(0, 32);
}

export interface CreateStudentAccountResult {
  auth_user_id: string;
  internal_email: string;
  internal_password: string;
}

// Internal: creates auth user + profiles row
export async function createStudentAccountForChild(data: {
  full_name: string;
  age?: number | null;
  school_name?: string | null;
}): Promise<CreateStudentAccountResult> {
  const supabase = createClient();

  const internal_email = generateInternalEmail();
  const internal_password = generateInternalPassword();

  const { data: signUpData, error } = await supabase.auth.signUp({
    email: internal_email,
    password: internal_password,
    options: {
      data: {
        is_internal_kid_account: true,
        display_name: data.full_name,
      },
    },
  });

  if (error || !signUpData.user) {
    throw new Error("Failed to create student account: " + (error?.message ?? "unknown"));
  }

  const { error: profileError } = await supabase.from("profiles").insert({
    id: signUpData.user.id,
    full_name: data.full_name,
    email: internal_email,
    account_type: "student",
    age: data.age ?? null,
    school_name: data.school_name ?? null,
    eco_points: 0,
  });

  if (profileError) {
    throw new Error("Failed to create student profile: " + profileError.message);
  }

  return {
    auth_user_id: signUpData.user.id,
    internal_email: internal_email,
    internal_password: internal_password,
  };
}

// Wraps account creation with parent/teacher session preservation
export async function createStudentAccountPreserveSession(data: {
  full_name: string;
  age?: number | null;
  school_name?: string | null;
}): Promise<CreateStudentAccountResult> {
  const supabase = createClient();

  const { data: existingSession } = await supabase.auth.getSession();
  if (!existingSession.session) {
    throw new Error("No active session. Please log in.");
  }

  const accessToken = existingSession.session.access_token;
  const refreshToken = existingSession.session.refresh_token;

  // Create child (this replaces session)
  const result = await createStudentAccountForChild(data);

  // Restore original session
  const { error: restoreError } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (restoreError) {
    console.error("[KidLogin] session restore failed:", restoreError);
    throw new Error("Account created but couldn't restore your session. Please log in again.");
  }

  return result;
}