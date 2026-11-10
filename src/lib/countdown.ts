/** Exam start: Thursday 12/11/2026, 10:45 Saigon time (UTC+7). */
export const EXAM_AT = new Date("2026-11-12T10:45:00+07:00");

export type Remaining = { d: number; h: number; m: number; s: number; done: boolean };

/** Splits the time left until `target` into days/hours/minutes/seconds; clamps at zero. */
export function remaining(now: number, target: number = EXAM_AT.getTime()): Remaining {
  const ms = Math.max(0, target - now);
  const t = Math.floor(ms / 1000);
  return { d: Math.floor(t / 86400), h: Math.floor((t % 86400) / 3600), m: Math.floor((t % 3600) / 60), s: t % 60, done: ms === 0 };
}
