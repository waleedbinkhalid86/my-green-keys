-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text,
  account_type text, -- 'student', 'parent', 'teacher'
  gender text, -- 'boy', 'girl'
  age integer,
  school_name text,
  eco_points integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Create children table
CREATE TABLE IF NOT EXISTS children (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  full_name text,
  age integer,
  gender text,
  username text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Create student_progress table
CREATE TABLE IF NOT EXISTS student_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id integer,
  completed boolean DEFAULT false,
  wpm integer,
  accuracy decimal,
  time_spent integer, -- seconds
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Create certificates table
CREATE TABLE IF NOT EXISTS certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  certificate_type text,
  lessons_completed integer,
  wpm integer,
  accuracy integer,
  eco_points integer,
  shared_with_parent boolean DEFAULT false,
  shared_with_parent_at timestamp with time zone,
  earned_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Parent notifications (used for "Share with Parent")
CREATE TABLE IF NOT EXISTS parent_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  child_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  kind text,
  message text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  read_at timestamp with time zone
);

-- Create custom_lessons table
CREATE TABLE IF NOT EXISTS custom_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text,
  content text,
  difficulty text,
  assigned_to uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Create eco_photos table
CREATE TABLE IF NOT EXISTS eco_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  action_type text, -- 'watering_plants', 'planting_tree', 'water_for_birds'
  photo_url text,
  status text DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  points_awarded integer DEFAULT 0,
  submitted_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  reviewed_at timestamp with time zone
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  plan_type text, -- 'free', 'family', 'school_starter', 'school_growth'
  status text DEFAULT 'active', -- 'active', 'cancelled', 'expired'
  promo_code text,
  discount_percent integer DEFAULT 0,
  started_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  expires_at timestamp with time zone
);

-- Game scores (mini-games)
CREATE TABLE IF NOT EXISTS game_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  game_name text NOT NULL,
  score integer NOT NULL DEFAULT 0,
  eco_points_earned integer NOT NULL DEFAULT 0,
  played_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Create promo_codes table
CREATE TABLE IF NOT EXISTS promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE,
  discount_type text, -- 'percentage', 'fixed', 'free_months'
  discount_value integer,
  applies_to text, -- 'all', 'family', 'school'
  usage_limit integer,
  usage_count integer DEFAULT 0,
  expires_at timestamp with time zone,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Create indexes for better query performance
CREATE INDEX idx_profiles_account_type ON profiles(account_type);
CREATE INDEX idx_children_parent_id ON children(parent_id);
CREATE INDEX idx_student_progress_student_id ON student_progress(student_id);
CREATE INDEX idx_student_progress_lesson_id ON student_progress(lesson_id);
CREATE INDEX idx_custom_lessons_created_by ON custom_lessons(created_by);
CREATE INDEX idx_custom_lessons_assigned_to ON custom_lessons(assigned_to);
CREATE INDEX idx_eco_photos_student_id ON eco_photos(student_id);
CREATE INDEX idx_eco_photos_status ON eco_photos(status);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_plan_type ON subscriptions(plan_type);
CREATE INDEX idx_promo_codes_code ON promo_codes(code);
CREATE INDEX idx_game_scores_student_id ON game_scores(student_id);
CREATE INDEX idx_game_scores_game_name ON game_scores(game_name);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE eco_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_scores ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for children
CREATE POLICY "Parents can view their own children" ON children
  FOR SELECT USING (auth.uid() = parent_id);

CREATE POLICY "Parents can insert their own children" ON children
  FOR INSERT WITH CHECK (auth.uid() = parent_id);

-- Create RLS policies for student_progress
CREATE POLICY "Students can view their own progress" ON student_progress
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view student progress" ON student_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.account_type = 'teacher'
    )
  );

-- Create RLS policies for eco_photos
CREATE POLICY "Students can view their own photos" ON eco_photos
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can submit photos" ON eco_photos
  FOR INSERT WITH CHECK (auth.uid() = student_id);

-- NOTE: Parent approval flow requires parents to see and review pending photos.
-- This policy is intentionally broad for MVP; tighten by relating parents to students.
CREATE POLICY "Parents can view pending eco photos" ON eco_photos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.account_type = 'parent'
    )
  );

CREATE POLICY "Parents can review eco photos" ON eco_photos
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.account_type = 'parent'
    )
  );

-- Parents need to award points (profiles.eco_points) to students.
CREATE POLICY "Parents can update eco points" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.account_type = 'parent'
    )
  );

-- Game scores: students record their own plays
CREATE POLICY "Students can view their own game scores" ON game_scores
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can insert their own game scores" ON game_scores
  FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Eco garden (persists between sessions)
CREATE TABLE IF NOT EXISTS eco_garden (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  garden_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_watered timestamp with time zone DEFAULT timezone('utc'::text, now()),
  total_plants integer NOT NULL DEFAULT 0,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  UNIQUE(student_id)
);

CREATE INDEX IF NOT EXISTS idx_eco_garden_student_id ON eco_garden(student_id);

ALTER TABLE eco_garden ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own eco garden" ON eco_garden
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can insert their own eco garden" ON eco_garden
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own eco garden" ON eco_garden
  FOR UPDATE USING (auth.uid() = student_id);

-- Subscriptions: users can view their own subscription row
CREATE POLICY "Users can view their own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================================
-- DAILY STREAK FEATURE
-- Hybrid approach: Fast counters on profiles + history table
-- ============================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_streak_date DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS streak_freezes INTEGER DEFAULT 2;

CREATE TABLE IF NOT EXISTS streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('lesson', 'game')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_streaks_user_date_type 
  ON streaks(user_id, activity_date, activity_type);

CREATE INDEX IF NOT EXISTS idx_streaks_user_id 
  ON streaks(user_id, activity_date DESC);

ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own streaks" ON streaks;
CREATE POLICY "Users can view their own streaks"
  ON streaks FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own streaks" ON streaks;
CREATE POLICY "Users can insert their own streaks"
  ON streaks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Parents can view children streaks" ON streaks;
CREATE POLICY "Parents can view children streaks"
  ON streaks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM children 
      WHERE children.id = streaks.user_id 
      AND children.parent_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Teachers can view enrolled student streaks" ON streaks;
CREATE POLICY "Teachers can view enrolled student streaks"
  ON streaks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM class_enrollments ce
      JOIN classes c ON c.id = ce.class_id
      WHERE ce.student_id = streaks.user_id
      AND c.teacher_id = auth.uid()
    )
  );

-- ============================================================
-- ECO GARDEN 3-DAY FREE TRIAL
-- ============================================================

ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS eco_garden_trial_started_at TIMESTAMPTZ DEFAULT NULL;

-- ============================================================
-- PLANET RANGER IDENTITY PROGRESSION
-- ============================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ranger_xp INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ranger_rank TEXT DEFAULT 'cadet';

CREATE TABLE IF NOT EXISTS ranger_xp_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  xp_amount INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ranger_xp_log_user_created
  ON ranger_xp_log(user_id, created_at DESC);

ALTER TABLE ranger_xp_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own xp log" ON ranger_xp_log;
CREATE POLICY "Users can view their own xp log"
  ON ranger_xp_log FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own xp entries" ON ranger_xp_log;
CREATE POLICY "Users can insert their own xp entries"
  ON ranger_xp_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Parents can view children xp log" ON ranger_xp_log;
CREATE POLICY "Parents can view children xp log"
  ON ranger_xp_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = ranger_xp_log.user_id
      AND children.parent_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Teachers can view enrolled student xp log" ON ranger_xp_log;
CREATE POLICY "Teachers can view enrolled student xp log"
  ON ranger_xp_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM class_enrollments ce
      JOIN classes c ON c.id = ce.class_id
      WHERE ce.student_id = ranger_xp_log.user_id
      AND c.teacher_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Parents can insert children eco photos" ON eco_photos;
CREATE POLICY "Parents can insert children eco photos"
  ON eco_photos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = eco_photos.student_id
      AND children.parent_id = auth.uid()
    )
  );
