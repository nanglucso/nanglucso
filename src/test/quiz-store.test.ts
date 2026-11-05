import { describe, it, expect } from "vitest";
import { applyAnswer, QUESTIONS } from "@/lib/quiz-store";

describe("quiz rules", () => {
  it("has 200 questions with 4 options each", () => {
    expect(QUESTIONS).toHaveLength(200);
    expect(QUESTIONS.every((q) => q.o.length === 4 && q.a >= 0 && q.a < 4)).toBe(true);
  });
  it("saves wrong answers and removes them once answered correctly", () => {
    let p = { answered: {}, wrong: [] as number[], best: 0 };
    p = applyAnswer(p, 5, false);
    expect(p.wrong).toEqual([5]);
    p = applyAnswer(p, 5, true);
    expect(p.wrong).toEqual([]);
  });
});
