import type { Metadata } from "next";
import TeacherShell from "@/components/teacher/TeacherShell";

export const metadata: Metadata = {
  title: "Teacher Dashboard | Nexscape",
  description: "Search lessons, launch 3D models, present on smart boards, assign activities, and track student engagement.",
};

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return <TeacherShell>{children}</TeacherShell>;
}
