-- Teacher bulk-upload: scope children rows to a class (run in Supabase SQL Editor when ready).

ALTER TABLE public.children
  ADD COLUMN IF NOT EXISTS teacher_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.children
  ADD COLUMN IF NOT EXISTS class_id uuid REFERENCES public.classes(id) ON DELETE SET NULL;

ALTER TABLE public.children
  ADD COLUMN IF NOT EXISTS grade integer;

CREATE INDEX IF NOT EXISTS idx_children_teacher_class
  ON public.children(teacher_id, class_id)
  WHERE teacher_id IS NOT NULL;
