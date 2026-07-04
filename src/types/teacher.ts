export type LessonSubject =
  | "physics"
  | "chemistry"
  | "biology"
  | "math"
  | "nursery"
  | "trigonometry";

export interface TeacherLesson {
  id: string;
  title: string;
  description: string;
  subject: LessonSubject;
  grades: string;
  durationMinutes: number;
  link: string;
  has3D: boolean;
  hasXR: boolean;
  tags: string[];
  presenterNotes: string[];
}

export type AssignmentStatus = "active" | "completed" | "draft";

export interface TeacherAssignment {
  id: string;
  title: string;
  className: string;
  lessonIds: string[];
  dueDate: string;
  joinCode: string;
  createdAt: string;
  status: AssignmentStatus;
  notes?: string;
}

export interface EngagementEvent {
  id: string;
  assignmentId: string;
  studentName: string;
  lessonId: string;
  lessonTitle: string;
  startedAt: string;
  completedAt?: string;
  durationMinutes: number;
  score?: number;
}

export interface TeacherProfile {
  name: string;
  school: string;
  subject: string;
}

export interface EngagementSummary {
  totalEvents: number;
  completedCount: number;
  avgDurationMinutes: number;
  activeStudents: number;
  completionRate: number;
}
