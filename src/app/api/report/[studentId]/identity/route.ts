import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { canAccessStudentReport } from "@/lib/report/access-server";
import { fetchStudentReportIdentity } from "@/lib/report/fetch-student-identity";

export async function GET(
  _req: Request,
  context: { params: Promise<{ studentId: string }> }
) {
  const { studentId } = await context.params;

  if (!studentId?.trim()) {
    return NextResponse.json({ error: "Student id required" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allowed = await canAccessStudentReport(supabase, user.id, studentId);
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const admin = createServiceRoleClient();
    const identity = await fetchStudentReportIdentity(admin, studentId);
    return NextResponse.json(identity);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load student identity";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
