import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import confetti from "canvas-confetti";
import { BookOpen, Search, Timer, XCircle, Home, ChevronLeft, ChevronRight, RotateCcw, Trophy } from "lucide-react";
import { QUESTIONS, CHAPTERS, useProgress, normalize, shuffle, type Question } from "@/lib/quiz-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ôn thi Năng lực số & AI — 200 câu trắc nghiệm" },
      { name: "description", content: "Ôn lý thuyết, tra cứu, thi thử có hẹn giờ và ôn lại câu sai cho môn Năng lực số và ứng dụng AI." },
      { property: "og:title", content: "Ôn thi Năng lực số & AI" },
      { property: "og:description", content: "200 câu trắc nghiệm: ôn tập, tra cứu, thi thử và ôn câu sai." },
    ],
  }),
  component: App,
});

type View = "home" | "study" | "search" | "exam" | "wrong";
type Progress = ReturnType<typeof useProgress>;

const NAV: { v: View; label: string; icon: typeof Home }[] = [
  { v: "home", label: "Trang chủ", icon: Home },
  { v: "study", label: "Ôn tập", icon: BookOpen },
  { v: "search", label: "Tra cứu", icon: Search },
  { v: "exam", label: "Thi thử", icon: Timer },
  { v: "wrong", label: "Câu sai", icon: XCircle },
];

function App() {
  const [view, setView] = useState<View>("home");
  const store = useProgress();
  return (
    <div className="min-h-screen pb-24 md:pb-10">
      <header className="sticky top-0 z-20 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <button onClick={() => setView("home")} className="font-display text-lg font-bold text-primary">
            NLS·AI
          </button>
          <nav className="hidden gap-1 md:flex">
            {NAV.map((n) => (
              <NavBtn key={n.v} n={n} active={view === n.v} onClick={() => setView(n.v)} badge={n.v === "wrong" ? store.progress.wrong.length : 0} />
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-6">
        {view === "home" && <HomeView store={store} go={setView} />}
        {view === "study" && <StudyView store={store} list={QUESTIONS} storageKey="study-idx" />}
        {view === "search" && <SearchView />}
        {view === "exam" && <ExamView store={store} />}
        {view === "wrong" && <WrongView store={store} />}
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-20 flex justify-around border-t bg-card py-2 md:hidden">
        {NAV.map((n) => (
          <NavBtn key={n.v} n={n} active={view === n.v} onClick={() => setView(n.v)} badge={n.v === "wrong" ? store.progress.wrong.length : 0} mobile />
        ))}
      </nav>
    </div>
  );
}

function NavBtn({ n, active, onClick, badge, mobile }: { n: (typeof NAV)[number]; active: boolean; onClick: () => void; badge: number; mobile?: boolean }) {
  const I = n.icon;
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${mobile ? "flex-col gap-0.5 text-[11px]" : ""} ${active ? "text-primary md:bg-secondary" : "text-muted-foreground hover:text-foreground"}`}
    >
      <I className="h-5 w-5 md:h-4 md:w-4" />
      {n.label}
      {badge > 0 && (
        <span className="absolute -top-1 right-0 rounded-full bg-destructive px-1.5 text-[10px] leading-4 text-destructive-foreground">{badge}</span>
      )}
    </button>
  );
}

function Bar({ value }: { value: number }) {
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
      <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${value}%` }} />
    </div>
  );
}

function HomeView({ store, go }: { store: Progress; go: (v: View) => void }) {
  const ans = store.progress.answered;
  const done = Object.keys(ans).length;
  const correct = Object.values(ans).filter(Boolean).length;
  const pct = Math.round((done / QUESTIONS.length) * 100);
  return (
    <div className="space-y-6">
      <section className="bg-hero rounded-3xl p-6 text-primary-foreground shadow-soft md:p-10">
        <p className="text-sm uppercase tracking-widest opacity-80">Học kỳ 1 · 2026–2027</p>
        <h1 className="mt-2 font-display text-3xl font-bold leading-tight md:text-5xl">Năng lực số & ứng dụng trí tuệ nhân tạo</h1>
        <p className="mt-3 max-w-xl opacity-90">200 câu trắc nghiệm qua 6 chương. Ôn từng câu, tra cứu nhanh, thi thử có hẹn giờ và ôn lại những câu từng làm sai.</p>
        <button onClick={() => go("study")} className="mt-6 rounded-xl bg-accent px-6 py-3 font-semibold text-accent-foreground shadow-soft transition-transform hover:scale-[1.03]">
          Bắt đầu học →
        </button>
      </section>
      <section className="rounded-2xl border bg-card p-5 shadow-soft">
        <div className="mb-2 flex justify-between text-sm">
          <span className="font-semibold">Tiến độ tổng quan</span>
          <span className="text-muted-foreground">{done}/{QUESTIONS.length} câu · {pct}%</span>
        </div>
        <Bar value={pct} />
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <Stat label="Đúng" value={correct} cls="text-success" />
          <Stat label="Cần ôn lại" value={store.progress.wrong.length} cls="text-destructive" />
          <Stat label="Điểm thi cao nhất" value={store.progress.best} cls="text-primary" />
        </div>
      </section>
      <section className="grid gap-3 sm:grid-cols-2">
        {Object.entries(CHAPTERS).map(([c, name]) => {
          const qs = QUESTIONS.filter((q) => q.chapter === +c);
          const d = qs.filter((q) => q.id in ans).length;
          return (
            <div key={c} className="rounded-xl border bg-card p-4">
              <div className="mb-2 flex justify-between text-sm">
                <span className="font-medium">Chương {c}. {name}</span>
                <span className="text-muted-foreground">{d}/{qs.length}</span>
              </div>
              <Bar value={(d / qs.length) * 100} />
            </div>
          );
        })}
      </section>
      {done > 0 && (
        <button onClick={() => confirm("Xoá toàn bộ tiến độ?") && store.reset()} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-destructive">
          <RotateCcw className="h-4 w-4" /> Đặt lại tiến độ
        </button>
      )}
    </div>
  );
}

function Stat({ label, value, cls }: { label: string; value: number | string; cls: string }) {
  return (
    <div className="rounded-xl bg-muted p-3">
      <div className={`text-2xl font-bold ${cls}`}>{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function Options({ q, picked, onPick, reveal }: { q: Question; picked: number | null; onPick: (i: number) => void; reveal: boolean }) {
  return (
    <div className="space-y-2.5">
      {q.o.map((o, i) => {
        let st = "border-border bg-card hover:border-primary hover:bg-secondary";
        if (reveal && i === q.a) st = "border-success bg-success-soft";
        else if (reveal && i === picked) st = "border-destructive bg-danger-soft";
        else if (!reveal && i === picked) st = "border-primary bg-secondary";
        else if (reveal) st = "border-border bg-card opacity-60";
        return (
          <button key={i} disabled={reveal && picked !== null && !onPick} onClick={() => onPick(i)} className={`flex w-full gap-3 rounded-xl border-2 p-3.5 text-left text-[15px] transition-all ${st}`}>
            <span className="font-bold uppercase">{"abcd"[i]}.</span>
            <span>{o}</span>
          </button>
        );
      })}
    </div>
  );
}

function QHead({ q, idx, total }: { q: Question; idx: number; total: number }) {
  return (
    <>
      <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
        <span className="rounded-full bg-secondary px-2.5 py-1">Chương {q.chapter} · {CHAPTERS[q.chapter]}</span>
        <span>{idx + 1}/{total}</span>
      </div>
      <h2 className="mb-5 text-lg font-semibold leading-relaxed">
        <span className="text-primary">Câu {q.id}:</span> {q.q}
      </h2>
    </>
  );
}

function StudyView({ store, list, storageKey, onCorrect }: { store: Progress; list: Question[]; storageKey?: string; onCorrect?: (id: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [picks, setPicks] = useState<Record<number, number>>({});
  useEffect(() => {
    if (!storageKey) return;
    const s = Number(localStorage.getItem(storageKey));
    if (s > 0 && s < list.length) setIdx(s);
  }, [storageKey, list.length]);
  const move = (i: number) => {
    setIdx(i);
    if (storageKey) localStorage.setItem(storageKey, String(i));
  };
  const q = list[Math.min(idx, list.length - 1)];
  if (!q) return null;
  const picked = picks[q.id] ?? null;
  const pick = (i: number) => {
    if (picked !== null) return;
    setPicks({ ...picks, [q.id]: i });
    store.record(q.id, i === q.a);
    if (i === q.a) onCorrect?.(q.id);
  };
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-soft md:p-7">
      <QHead q={q} idx={idx} total={list.length} />
      <Options q={q} picked={picked} onPick={pick} reveal={picked !== null} />
      {picked !== null && (
        <p className={`mt-4 font-semibold ${picked === q.a ? "text-success" : "text-destructive"}`}>
          {picked === q.a ? "✓ Chính xác!" : `✗ Chưa đúng — đáp án đúng là ${"ABCD"[q.a]}.`}
        </p>
      )}
      <div className="mt-6 flex justify-between gap-3">
        <button disabled={idx === 0} onClick={() => move(idx - 1)} className="flex items-center gap-1 rounded-xl border px-4 py-2.5 font-medium disabled:opacity-40">
          <ChevronLeft className="h-4 w-4" /> Câu trước đó
        </button>
        <button disabled={idx >= list.length - 1} onClick={() => move(idx + 1)} className="flex items-center gap-1 rounded-xl bg-primary px-4 py-2.5 font-medium text-primary-foreground disabled:opacity-40">
          Câu tiếp theo <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function SearchView() {
  const [k, setK] = useState("");
  const res = useMemo(() => {
    const n = normalize(k.trim());
    if (!n) return [];
    return QUESTIONS.filter((q) => normalize(`câu ${q.id} ${q.q} ${q.o.join(" ")}`).includes(n)).slice(0, 50);
  }, [k]);
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input autoFocus value={k} onChange={(e) => setK(e.target.value)} placeholder="Gõ từ khoá, ví dụ: mật khẩu, prompt, NotebookLM…" className="w-full rounded-2xl border-2 bg-card py-4 pl-12 pr-4 outline-none focus:border-primary" />
      </div>
      {k && <p className="text-sm text-muted-foreground">{res.length} kết quả{res.length === 50 ? " (hiển thị 50 đầu tiên)" : ""}</p>}
      {res.map((q) => (
        <div key={q.id} className="rounded-xl border bg-card p-4">
          <p className="font-medium"><span className="text-primary">Câu {q.id}:</span> {q.q}</p>
          <p className="mt-2 rounded-lg bg-success-soft p-2.5 text-sm"><b>{"ABCD"[q.a]}.</b> {q.o[q.a]}</p>
        </div>
      ))}
    </div>
  );
}

function ExamView({ store }: { store: Progress }) {
  const [count, setCount] = useState(40);
  const [mins, setMins] = useState(40);
  const [qs, setQs] = useState<Question[] | null>(null);
  const [ans, setAns] = useState<Record<number, number>>({});
  const [left, setLeft] = useState(0);
  const [done, setDone] = useState(false);
  const [cur, setCur] = useState(0);

  const submit = () => {
    if (!qs || done) return;
    setDone(true);
    qs.forEach((q) => q.id in ans && store.record(q.id, ans[q.id] === q.a));
    const score = Math.round((qs.filter((q) => ans[q.id] === q.a).length / qs.length) * 100) / 10;
    store.setBest(score);
    if (score >= 8) {
      const end = Date.now() + 2500;
      (function frame() {
        confetti({ particleCount: 6, angle: 60, spread: 70, origin: { x: 0 } });
        confetti({ particleCount: 6, angle: 120, spread: 70, origin: { x: 1 } });
        if (Date.now() < end) requestAnimationFrame(frame);
      })();
    }
  };

  useEffect(() => {
    if (!qs || done) return;
    if (left <= 0) { submit(); return; }
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  });

  if (!qs)
    return (
      <div className="mx-auto max-w-md rounded-2xl border bg-card p-6 text-center shadow-soft">
        <Trophy className="mx-auto h-12 w-12 text-accent" />
        <h2 className="mt-3 font-display text-2xl font-bold">Gameshow thi thử</h2>
        <p className="mt-1 text-sm text-muted-foreground">Câu hỏi được trộn ngẫu nhiên. Đạt từ 8 điểm để nhận pháo hoa!</p>
        <div className="mt-5 grid grid-cols-2 gap-3 text-left text-sm">
          <label>Số câu
            <select value={count} onChange={(e) => { setCount(+e.target.value); setMins(+e.target.value); }} className="mt-1 w-full rounded-lg border bg-background p-2">
              {[20, 40, 60, 100, 200].map((n) => <option key={n}>{n}</option>)}
            </select>
          </label>
          <label>Thời gian (phút)
            <input type="number" min={1} value={mins} onChange={(e) => setMins(Math.max(1, +e.target.value))} className="mt-1 w-full rounded-lg border bg-background p-2" />
          </label>
        </div>
        <button onClick={() => { setQs(shuffle(QUESTIONS).slice(0, count)); setAns({}); setDone(false); setCur(0); setLeft(mins * 60); }} className="mt-6 w-full rounded-xl bg-accent py-3 font-semibold text-accent-foreground">
          Bắt đầu thi
        </button>
      </div>
    );

  const correct = qs.filter((q) => ans[q.id] === q.a).length;
  const q = qs[cur];
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-2xl border bg-card p-4 shadow-soft">
        {done ? (
          <div>
            <div className="font-display text-3xl font-bold text-primary">{(Math.round((correct / qs.length) * 100) / 10).toFixed(1)} điểm</div>
            <div className="text-sm text-muted-foreground">Đúng {correct}/{qs.length} câu</div>
          </div>
        ) : (
          <div className={`font-mono text-2xl font-bold ${left < 60 ? "text-destructive" : ""}`}>⏱ {mm}:{ss}</div>
        )}
        {done ? (
          <button onClick={() => setQs(null)} className="rounded-xl bg-primary px-4 py-2 font-medium text-primary-foreground">Thi lại</button>
        ) : (
          <button onClick={() => confirm(`Nộp bài? Đã làm ${Object.keys(ans).length}/${qs.length} câu.`) && submit()} className="rounded-xl bg-accent px-4 py-2 font-semibold text-accent-foreground">Nộp bài</button>
        )}
      </div>
      <div className="rounded-2xl border bg-card p-5 shadow-soft md:p-7">
        <QHead q={q} idx={cur} total={qs.length} />
        <Options q={q} picked={ans[q.id] ?? null} onPick={(i) => !done && setAns({ ...ans, [q.id]: i })} reveal={done} />
        <div className="mt-6 flex justify-between">
          <button disabled={cur === 0} onClick={() => setCur(cur - 1)} className="flex items-center gap-1 rounded-xl border px-4 py-2.5 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /> Trước</button>
          <button disabled={cur === qs.length - 1} onClick={() => setCur(cur + 1)} className="flex items-center gap-1 rounded-xl bg-primary px-4 py-2.5 text-primary-foreground disabled:opacity-40">Sau <ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {qs.map((x, i) => {
          let st = x.id in ans ? "bg-secondary border-primary" : "bg-card";
          if (done) st = ans[x.id] === x.a ? "bg-success-soft border-success" : "bg-danger-soft border-destructive";
          return <button key={x.id} onClick={() => setCur(i)} className={`h-9 w-9 rounded-lg border text-xs font-medium ${st} ${i === cur ? "ring-2 ring-ring" : ""}`}>{i + 1}</button>;
        })}
      </div>
    </div>
  );
}

function WrongView({ store }: { store: Progress }) {
  const [snapshot, setSnapshot] = useState<number[] | null>(null);
  const ids = snapshot ?? store.progress.wrong;
  const list = QUESTIONS.filter((q) => ids.includes(q.id));
  if (!snapshot && list.length === 0)
    return (
      <div className="rounded-2xl border bg-card p-10 text-center shadow-soft">
        <p className="text-4xl">🎉</p>
        <p className="mt-2 font-semibold">Chưa có câu sai nào cần ôn lại.</p>
        <p className="text-sm text-muted-foreground">Những câu trả lời sai sẽ tự động được lưu tại đây.</p>
      </div>
    );
  if (snapshot)
    return (
      <div className="space-y-3">
        <button onClick={() => setSnapshot(null)} className="text-sm text-primary">← Danh sách câu sai</button>
        <StudyView store={store} list={list} />
        <p className="text-center text-xs text-muted-foreground">Trả lời đúng sẽ tự xoá câu khỏi danh sách câu sai.</p>
      </div>
    );
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">{list.length} câu cần ôn lại</h2>
        <button onClick={() => setSnapshot([...store.progress.wrong])} className="rounded-xl bg-primary px-4 py-2 font-medium text-primary-foreground">Ôn lại ngay</button>
      </div>
      {list.map((q) => (
        <div key={q.id} className="rounded-xl border bg-card p-4">
          <p className="font-medium"><span className="text-destructive">Câu {q.id}:</span> {q.q}</p>
          <p className="mt-2 rounded-lg bg-success-soft p-2.5 text-sm"><b>{"ABCD"[q.a]}.</b> {q.o[q.a]}</p>
          <button onClick={() => store.removeWrong(q.id)} className="mt-2 text-xs text-muted-foreground hover:text-foreground">Đánh dấu đã thuộc</button>
        </div>
      ))}
    </div>
  );
}
