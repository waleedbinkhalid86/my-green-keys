-- Kid login Phase 1: parent login codes + teacher classes.
-- Run manually in Supabase SQL Editor when ready.
-- If you already have legacy `classes` / `class_enrollments` with different columns,
-- reconcile or backup before applying.

-- ===== PARENT-SIDE: Add login codes to children table =====

ALTER TABLE children 
  ADD COLUMN IF NOT EXISTS login_code TEXT UNIQUE;

ALTER TABLE children 
  ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE children 
  ADD COLUMN IF NOT EXISTS code_created_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_children_login_code ON children(login_code) 
  WHERE login_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_children_auth_user_id ON children(auth_user_id) 
  WHERE auth_user_id IS NOT NULL;

-- ===== TEACHER-SIDE: Create classes table (if not exists) =====

CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  class_code TEXT UNIQUE NOT NULL,
  school_name TEXT,
  grade_level TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  archived_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_classes_teacher_id ON classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_classes_class_code ON classes(class_code);

-- ===== TEACHER-SIDE: Class enrollments =====

CREATE TABLE IF NOT EXISTS class_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_auth_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, student_auth_user_id)
);

CREATE INDEX IF NOT EXISTS idx_class_enrollments_class_id ON class_enrollments(class_id);
CREATE INDEX IF NOT EXISTS idx_class_enrollments_student ON class_enrollments(student_auth_user_id);

-- ===== ROW LEVEL SECURITY =====

ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers manage their own classes" ON classes
  FOR ALL USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers see enrollments in their classes" ON class_enrollments
  FOR ALL USING (
    class_id IN (SELECT id FROM classes WHERE teacher_id = auth.uid())
  );

CREATE POLICY "Students see their own enrollment" ON class_enrollments
  FOR SELECT USING (auth.uid() = student_auth_user_id);

CREATE POLICY "Students insert their own enrollment" ON class_enrollments
  FOR INSERT WITH CHECK (auth.uid() = student_auth_user_id);

-- Allow class lookup by code (anyone, for join flow)
CREATE POLICY "Class code lookup is public" ON classes
  FOR SELECT USING (true);

-- ===== Policies that reference class_enrollments (column: student_auth_user_id) =====

DROP POLICY IF EXISTS "Teachers can view enrolled student streaks" ON streaks;
CREATE POLICY "Teachers can view enrolled student streaks"
  ON streaks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM class_enrollments ce
      JOIN classes c ON c.id = ce.class_id
      WHERE ce.student_auth_user_id = streaks.user_id
      AND c.teacher_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Teachers can view enrolled student xp log" ON ranger_xp_log;
CREATE POLICY "Teachers can view enrolled student xp log"
  ON ranger_xp_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM class_enrollments ce
      JOIN classes c ON c.id = ce.class_id
      WHERE ce.student_auth_user_id = ranger_xp_log.user_id
      AND c.teacher_id = auth.uid()
    )
  );
