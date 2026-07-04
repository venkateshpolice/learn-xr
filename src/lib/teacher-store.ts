import type {
  EngagementEvent,
  EngagementSummary,
  TeacherAssignment,
  TeacherProfile,
} from "@/types/teacher";
import { getLessonById } from "@/data/teacher-lessons";

const ASSIGNMENTS_KEY = "nexscape-teacher-assignments";
const ENGAGEMENT_KEY = "nexscape-teacher-engagement";
const PROFILE_KEY = "nexscape-teacher-profile";
const SEEDED_KEY = "nexscape-teacher-seeded";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function generateJoinCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function getProfile(): TeacherProfile {
  return readJson<TeacherProfile>(PROFILE_KEY, {
    name: "Ms. Priya Sharma",
    school: "Delhi Public School",
    subject: "Science",
  });
}

export function saveProfile(profile: TeacherProfile): void {
  writeJson(PROFILE_KEY, profile);
}

export function getAssignments(): TeacherAssignment[] {
  return readJson<TeacherAssignment[]>(ASSIGNMENTS_KEY, []);
}

export function saveAssignments(assignments: TeacherAssignment[]): void {
  writeJson(ASSIGNMENTS_KEY, assignments);
}

export function getAssignmentById(id: string): TeacherAssignment | undefined {
  return getAssignments().find((a) => a.id === id);
}

export function getAssignmentByCode(code: string): TeacherAssignment | undefined {
  return getAssignments().find((a) => a.joinCode.toUpperCase() === code.toUpperCase());
}

export function createAssignment(
  data: Omit<TeacherAssignment, "id" | "joinCode" | "createdAt" | "status">,
): TeacherAssignment {
  const assignment: TeacherAssignment = {
    ...data,
    id: uid(),
    joinCode: generateJoinCode(),
    createdAt: new Date().toISOString(),
    status: "active",
  };
  const all = getAssignments();
  saveAssignments([assignment, ...all]);
  return assignment;
}

export function updateAssignment(id: string, patch: Partial<TeacherAssignment>): TeacherAssignment | undefined {
  const all = getAssignments();
  const idx = all.findIndex((a) => a.id === id);
  if (idx === -1) return undefined;
  all[idx] = { ...all[idx], ...patch };
  saveAssignments(all);
  return all[idx];
}

export function deleteAssignment(id: string): void {
  saveAssignments(getAssignments().filter((a) => a.id !== id));
}

export function getEngagementEvents(): EngagementEvent[] {
  return readJson<EngagementEvent[]>(ENGAGEMENT_KEY, []);
}

export function saveEngagementEvents(events: EngagementEvent[]): void {
  writeJson(ENGAGEMENT_KEY, events);
}

export function recordEngagementStart(
  assignmentId: string,
  studentName: string,
  lessonId: string,
): EngagementEvent {
  const lesson = getLessonById(lessonId);
  const event: EngagementEvent = {
    id: uid(),
    assignmentId,
    studentName: studentName.trim(),
    lessonId,
    lessonTitle: lesson?.title ?? lessonId,
    startedAt: new Date().toISOString(),
    durationMinutes: 0,
  };
  const all = getEngagementEvents();
  saveEngagementEvents([event, ...all]);
  return event;
}

export function recordEngagementComplete(
  eventId: string,
  score?: number,
): EngagementEvent | undefined {
  const all = getEngagementEvents();
  const idx = all.findIndex((e) => e.id === eventId);
  if (idx === -1) return undefined;
  const started = new Date(all[idx].startedAt).getTime();
  const durationMinutes = Math.max(1, Math.round((Date.now() - started) / 60000));
  all[idx] = {
    ...all[idx],
    completedAt: new Date().toISOString(),
    durationMinutes,
    score,
  };
  saveEngagementEvents(all);
  return all[idx];
}

export function getEngagementSummary(assignmentId?: string): EngagementSummary {
  const events = getEngagementEvents().filter(
    (e) => !assignmentId || e.assignmentId === assignmentId,
  );
  const completed = events.filter((e) => e.completedAt);
  const students = new Set(events.map((e) => e.studentName));
  const avgDuration =
    completed.length > 0
      ? Math.round(completed.reduce((s, e) => s + e.durationMinutes, 0) / completed.length)
      : 0;

  return {
    totalEvents: events.length,
    completedCount: completed.length,
    avgDurationMinutes: avgDuration,
    activeStudents: students.size,
    completionRate: events.length ? Math.round((completed.length / events.length) * 100) : 0,
  };
}

export function getEngagementByLesson(): { lessonId: string; title: string; count: number; completed: number }[] {
  const events = getEngagementEvents();
  const map = new Map<string, { title: string; count: number; completed: number }>();

  for (const e of events) {
    const cur = map.get(e.lessonId) ?? { title: e.lessonTitle, count: 0, completed: 0 };
    cur.count += 1;
    if (e.completedAt) cur.completed += 1;
    map.set(e.lessonId, cur);
  }

  return [...map.entries()]
    .map(([lessonId, data]) => ({ lessonId, ...data }))
    .sort((a, b) => b.count - a.count);
}

export function seedDemoData(): void {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(SEEDED_KEY)) return;

  const solar = getLessonById("solar-system");
  const photosynthesis = getLessonById("photosynthesis");
  const waterCycle = getLessonById("water-cycle");

  if (!solar || !photosynthesis || !waterCycle) return;

  const assignment = createAssignment({
    title: "Week 4 — Solar System & Life Science",
    className: "Class 8-A",
    lessonIds: [solar.id, photosynthesis.id, waterCycle.id],
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    notes: "Complete all three labs before Friday's quiz.",
  });

  const students = ["Aarav K.", "Diya M.", "Rohan S.", "Ananya P.", "Vihaan T."];
  const lessons = [solar, photosynthesis, waterCycle];
  const events: EngagementEvent[] = [];

  for (const student of students) {
    for (const lesson of lessons.slice(0, student === "Vihaan T." ? 1 : 3)) {
      const started = new Date(Date.now() - Math.random() * 5 * 86400000);
      const completed = student !== "Vihaan T." || lesson.id === solar.id;
      const duration = 12 + Math.floor(Math.random() * 18);
      events.push({
        id: uid(),
        assignmentId: assignment.id,
        studentName: student,
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        startedAt: started.toISOString(),
        completedAt: completed ? new Date(started.getTime() + duration * 60000).toISOString() : undefined,
        durationMinutes: completed ? duration : 0,
        score: completed ? 70 + Math.floor(Math.random() * 30) : undefined,
      });
    }
  }

  saveEngagementEvents(events);
  localStorage.setItem(SEEDED_KEY, "1");
}

export function getJoinUrl(code: string): string {
  if (typeof window === "undefined") return `/teacher/join/${code}`;
  return `${window.location.origin}/teacher/join/${code}`;
}
