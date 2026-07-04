export type UserRole = "student" | "teacher" | "school" | "admin";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  grade?: string;
  subject?: string;
  schoolName?: string;
  schoolCode?: string;
}

export interface SignUpPayload {
  role: UserRole;
  name: string;
  email: string;
  password: string;
  grade?: string;
  subject?: string;
  schoolName?: string;
  schoolCode?: string;
  adminInviteCode?: string;
}

export interface SignInPayload {
  email: string;
  password: string;
  role?: UserRole;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  student: "Student",
  teacher: "Teacher",
  school: "School",
  admin: "Admin",
};

export const ROLE_DASHBOARD: Record<UserRole, string> = {
  student: "/student",
  teacher: "/teacher",
  school: "/school",
  admin: "/admin",
};

export const ROLE_HOME: Record<UserRole, string> = ROLE_DASHBOARD;
