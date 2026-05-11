export interface ChildWithCode {
  id: string;
  parent_id: string;
  full_name: string;
  age: number | null;
  gender: string | null;
  username: string | null;
  login_code: string | null;
  auth_user_id: string | null;
  code_created_at: string | null;
  created_at: string;
}

export interface SchoolClass {
  id: string;
  teacher_id: string;
  name: string;
  class_code: string;
  school_name: string | null;
  grade_level: string | null;
  created_at: string;
  archived_at: string | null;
}

export interface ClassEnrollment {
  id: string;
  class_id: string;
  student_auth_user_id: string;
  display_name: string;
  joined_at: string;
}
