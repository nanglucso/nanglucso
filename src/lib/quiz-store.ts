import { useCallback, useEffect, useState } from "react";
import raw from "@/data/questions.json";

export type Question = { id: number; chapter: number; q: string; o: string[]; a: number };
export const QUESTIONS = raw as Question[];

export const CHAPTERS: Record<number, string> = {
  1: "Nhập môn năng lực số",
  2: "Khai thác dữ liệu & thông tin",
  3: "Giao tiếp & hợp tác",
  4: "Sáng tạo nội dung số",
  5: "An toàn thông tin & đạo đức số",
  6: "Ứng dụng AI & giải quyết vấn đề",
};

type Progress = { answered: Record<number, boolean>; wrong: number[]; best: number };
const KEY = "nls-ai-progress-v1";
const empty: Progress = { answered: {}, wrong: [], best: 0 };

/** Pure update rule: wrong answers enter the review list; a later correct answer removes them. */
export function applyAnswer(p: Progress, id: number, correct: boolean): Progress {
  const wrong = correct ? p.wrong.filter((w) => w !== id) : p.wrong.includes(id) ? p.wrong : [...p.wrong, id];
  return { ...p, answered: { ...p.answered, [id]: correct }, wrong };
}

export function useProgress() {
  const [p, setP] = useState<Progress>(empty);
  useEffect(() => {
    try {
      const s = localStorage.getItem(KEY);
      if (s) setP({ ...empty, ...JSON.parse(s) });
    } catch {}
  }, []);
  const save = useCallback((fn: (p: Progress) => Progress) => {
    setP((prev) => {
      const next = fn(prev);
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);
  return {
    progress: p,
    record: (id: number, correct: boolean) => save((x) => applyAnswer(x, id, correct)),
    setBest: (score: number) => save((x) => ({ ...x, best: Math.max(x.best, score) })),
    removeWrong: (id: number) => save((x) => ({ ...x, wrong: x.wrong.filter((w) => w !== id) })),
    reset: () => save(() => empty),
  };
}

export function normalize(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");
}

/** Question order for a study session: kept as given, or shuffled when requested. */
export function makeOrder(ids: number[], shuffled: boolean): number[] {
  return shuffled ? shuffle(ids) : [...ids];
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j] as T, a[i] as T];
  }
  return a;
}
