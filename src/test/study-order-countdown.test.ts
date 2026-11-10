import { describe, it, expect } from "vitest";
import { makeOrder } from "@/lib/quiz-store";
import { EXAM_AT, remaining } from "@/lib/countdown";

describe("study order", () => {
  const ids = Array.from({ length: 50 }, (_, i) => i + 1);
  it("sequential mode keeps the original order", () => {
    expect(makeOrder(ids, false)).toEqual(ids);
  });
  it("shuffled mode uses every question exactly once in a new order", () => {
    const o = makeOrder(ids, true);
    expect([...o].sort((a, b) => a - b)).toEqual(ids);
    expect(o).not.toEqual(ids);
  });
});

describe("exam countdown", () => {
  it("targets 12/11/2026 at 10:45 Saigon time", () => {
    expect(EXAM_AT.toISOString()).toBe("2026-11-12T03:45:00.000Z");
  });
  it("splits the time left into days, hours, minutes, seconds", () => {
    const now = new Date("2026-11-10T20:36:30+07:00").getTime();
    expect(remaining(now)).toEqual({ d: 1, h: 14, m: 8, s: 30, done: false });
  });
  it("stops at zero once the exam has started", () => {
    expect(remaining(EXAM_AT.getTime() + 5000)).toEqual({ d: 0, h: 0, m: 0, s: 0, done: true });
  });
});
