// Shared internal types for the backend hook layer (extracted from useBackend.ts).
export interface ScheduleEntry {
  day: number;
  period: number;
  courseId: string;
  room: string;
  startTime: string;
  endTime: string;
}
