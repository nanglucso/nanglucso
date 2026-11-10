import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import confetti from "canvas-confetti";
import { BookOpen, Search, Timer, XCircle, Home, ChevronLeft, ChevronRight, RotateCcw, Trophy, Settings, Sun, Moon, MonitorSmartphone, Check, ListOrdered, Shuffle, ArrowRight, Play } from "lucide-react";
import { QUESTIONS, CHAPTERS, useProgress, normalize, shuffle, makeOrder, type Question } from "@/lib/quiz-store";
import { useTheme, type Theme } from "@/lib/theme";
import { SiteFooter } from "@/components/SiteFooter";
import { ExamCountdown } from "@/components/ExamCountdown";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ôn thi Năng lực số & AI — 200 câu trắc nghiệm" },
      { name: "description", content: "Ôn lý thuyết, tra cứu, thi thử có hẹn giờ và ôn lại câu sai cho môn Năng lực số và ứng dụng AI." },
      { property: "og:title", content: "Ôn thi Năng lực số & AI" },
      { property: "og:description", content: "200 câu trắc nghiệm: ôn tập, tra cứu, thi thử và ôn câu sai." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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

/** Staggered entrance delay for lists of cards. */
const stagger = (i: number): CSSProperties => ({ animationDelay: `${Math.min(i, 10) * 55}ms` });

const card = "rounded-2xl border bg-card shadow-soft";
const lift = "transition-all duration-300 ease-spring hover:-translate-y-1 hover:shadow-lift";
const btnPrimary = "inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary font-semibold text-primary-foreground transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:shadow-lift active:translate-y-0 active:scale-[0.97] disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-none";
const btnGhost = "inline-flex items-center justify-center gap-1.5 rounded-xl border bg-card font-medium transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:border-primary hover:text-primary active:translate-y-0 active:scale-[0.97] disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:border-border disabled:hover:text-foreground";

function App() {
  const [view, setView] = useState<View>("home");
  const store = useProgress();
  const { theme, setTheme } = useTheme();
  const go = (v: View) => {
    setView(v);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <div className="min-h-screen pb-24 md:pb-10">
      <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <button onClick={() => go("home")} className="group font-display text-lg font-bold text-primary">
            NLS<span className="inline-block text-accent transition-transform duration-500 ease-spring group-hover:rotate-180">·</span>AI
          </button>
          <nav className="hidden gap-1 rounded-xl bg-muted/60 p-1 md:flex">
            {NAV.map((n) => (
              <NavBtn key={n.v} n={n} active={view === n.v} onClick={() => go(n.v)} badge={n.v === "wrong" ? store.progress.wrong.length : 0} />
            ))}
          </nav>
          <ThemeMenu theme={theme} setTheme={setTheme} />
        </div>
      </header>
      <main key={view} className="mx-auto max-w-4xl animate-rise px-4 py-6">
        {view === "home" && <HomeView store={store} go={go} />}
        {view === "study" && <StudyHub store={store} />}
        {view === "search" && <SearchView />}
        {view === "exam" && <ExamView store={store} />}
        {view === "wrong" && <WrongView store={store} />}
      </main>
      <SiteFooter />
      <nav className="fixed inset-x-0 bottom-0 z-20 flex justify-around border-t bg-card/90 py-2 backdrop-blur-xl md:hidden">
        {NAV.map((n) => (
          <NavBtn key={n.v} n={n} active={view === n.v} onClick={() => go(n.v)} badge={n.v === "wrong" ? store.progress.wrong.length : 0} mobile />
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
      className={`relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-300 ease-spring ${mobile ? "flex-col gap-0.5 text-[11px]" : ""} ${active ? "text-primary md:bg-card md:shadow-soft" : "text-muted-foreground hover:text-foreground"}`}
    >
      <I className={`h-5 w-5 transition-transform duration-300 ease-spring md:h-4 md:w-4 ${active ? "scale-110" : ""}`} />
      {n.label}
      {mobile && <span className={`absolute -bottom-2 h-1 rounded-full bg-primary transition-all duration-300 ease-spring ${active ? "w-5 opacity-100" : "w-0 opacity-0"}`} />}
      {badge > 0 && (
        <span key={badge} className="absolute -top-1 right-0 animate-pop rounded-full bg-destructive px-1.5 text-[10px] leading-4 text-destructive-foreground">{badge}</span>
      )}
    </button>
  );
}

const THEME_OPTS: { v: Theme; label: string; icon: typeof Sun }[] = [
  { v: "light", label: "Sáng", icon: Sun },
  { v: "dark", label: "Tối", icon: Moon },
  { v: "system", label: "Theo hệ thống", icon: MonitorSmartphone },
];

function ThemeMenu({ theme, setTheme }: { theme: Theme; setTheme: (t: Theme) => void }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={box}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Cài đặt giao diện"
        aria-haspopup="menu"
        aria-expanded={open}
        className={`flex h-9 w-9 items-center justify-center rounded-lg border bg-card transition-all duration-300 ease-spring hover:bg-secondary ${open ? "border-primary text-primary" : "text-foreground"}`}
      >
        <Settings className={`h-5 w-5 transition-transform duration-500 ease-spring ${open ? "rotate-90" : ""}`} />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 z-30 mt-2 w-52 origin-top-right animate-in rounded-xl border bg-card p-1.5 shadow-lift duration-200 fade-in zoom-in-95 slide-in-from-top-1">
          <p className="px-2.5 pt-1.5 pb-1 text-xs font-semibold tracking-widest text-muted-foreground uppercase">Giao diện</p>
          {THEME_OPTS.map((o) => {
            const I = o.icon;
            const on = theme === o.v;
            return (
              <button
                key={o.v}
                role="menuitemradio"
                aria-checked={on}
                onClick={() => {
                  setTheme(o.v);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${on ? "bg-secondary text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
              >
                <I className="h-4 w-4" />
                {o.label}
                {on && <Check className="ml-auto h-4 w-4" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Bar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div className="h-full rounded-full bg-primary transition-[width] duration-700 ease-spring" style={{ width: `${value}%` }} />
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
      <section className="bg-hero relative overflow-hidden rounded-3xl p-6 text-hero-fg shadow-soft md:p-9">
        <div aria-hidden className="hero-orb pointer-events-none absolute -top-28 -right-20 h-80 w-80 animate-drift rounded-full" />
        <div aria-hidden className="hero-orb pointer-events-none absolute -bottom-32 left-1/4 h-96 w-96 animate-drift rounded-full [animation-delay:-7s]" />
        <div className="relative flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
          <div className="max-w-md">
            <p className="text-xs font-semibold tracking-[0.25em] uppercase opacity-80">Học kỳ 1 · 2026–2027</p>
            <h1 className="mt-3 font-display text-3xl leading-[1.15] font-bold md:text-[2.6rem]">
              Năng lực số <span className="italic opacity-90">&</span> ứng dụng trí tuệ nhân tạo
            </h1>
            <p className="mt-3 text-[15px] opacity-90">200 câu trắc nghiệm qua 6 chương. Ôn từng câu, tra cứu nhanh, thi thử có hẹn giờ và ôn lại những câu từng làm sai.</p>
            <button onClick={() => go("study")} className="group mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 font-semibold text-accent-foreground shadow-soft transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:shadow-lift active:scale-[0.97]">
              Bắt đầu học <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-spring group-hover:translate-x-1" />
            </button>
          </div>
          <ExamCountdown />
        </div>
      </section>
      <section className={`${card} animate-rise p-5`} style={stagger(1)}>
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
        {Object.entries(CHAPTERS).map(([c, name], i) => {
          const qs = QUESTIONS.filter((q) => q.chapter === +c);
          const d = qs.filter((q) => q.id in ans).length;
          return (
            <div key={c} className={`animate-rise rounded-xl border bg-card p-4 ${lift}`} style={stagger(i + 2)}>
              <div className="mb-2 flex justify-between gap-2 text-sm">
                <span className="font-medium"><span className="font-display text-primary italic">{c}.</span> {name}</span>
                <span className="shrink-0 text-muted-foreground tabular-nums">{d}/{qs.length}</span>
              </div>
              <Bar value={(d / qs.length) * 100} />
            </div>
          );
        })}
      </section>
      {done > 0 && (
        <button onClick={() => confirm("Xoá toàn bộ tiến độ?") && store.reset()} className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-destructive">
          <RotateCcw className="h-4 w-4" /> Đặt lại tiến độ
        </button>
      )}
    </div>
  );
}

function Stat({ label, value, cls }: { label: string; value: number | string; cls: string }) {
  return (
    <div className="rounded-xl bg-muted p-3">
      <div className={`font-display text-2xl font-bold tabular-nums ${cls}`}>{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function Options({ q, picked, onPick, reveal }: { q: Question; picked: number | null; onPick: (i: number) => void; reveal: boolean }) {
  return (
    <div className="space-y-2.5">
      {q.o.map((o, i) => {
        let st = "border-border bg-card hover:-translate-y-0.5 hover:border-primary hover:bg-secondary hover:shadow-soft";
        let anim = "";
        if (reveal && i === q.a) { st = "border-success bg-success-soft"; anim = picked === i ? "animate-pop" : ""; }
        else if (reveal && i === picked) { st = "border-destructive bg-danger-soft"; anim = "animate-shake"; }
        else if (!reveal && i === picked) st = "border-primary bg-secondary";
        else if (reveal) st = "border-border bg-card opacity-55";
        return (
          <button
            key={i}
            disabled={reveal && picked !== null && !onPick}
            onClick={() => onPick(i)}
            className={`group flex w-full animate-rise items-start gap-3 rounded-xl border-2 p-3.5 text-left text-[15px] transition-all duration-300 ease-spring active:scale-[0.99] ${st} ${anim}`}
            style={stagger(i + 1)}
          >
            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold uppercase transition-colors duration-300 ${reveal && i === q.a ? "border-success bg-success text-primary-foreground" : reveal && i === picked ? "border-destructive bg-destructive text-destructive-foreground" : "group-hover:border-primary group-hover:text-primary"}`}>
              {"abcd"[i]}
            </span>
            <span className="pt-0.5">{o}</span>
          </button>
        );
      })}
    </div>
  );
}

function QHead({ q, idx, total }: { q: Question; idx: number; total: number }) {
  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="truncate rounded-full bg-secondary px-2.5 py-1">Chương {q.chapter} · {CHAPTERS[q.chapter]}</span>
        <span className="shrink-0 font-display text-sm italic tabular-nums"><b className="text-foreground not-italic">{idx + 1}</b>/{total}</span>
      </div>
      <div className="mb-4 h-1 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-accent transition-[width] duration-500 ease-spring" style={{ width: `${((idx + 1) / total) * 100}%` }} />
      </div>
      <h2 className="mb-5 text-lg leading-relaxed font-semibold">
        <span className="font-display text-primary">Câu {q.id}.</span> {q.q}
      </h2>
    </>
  );
}

type Session = { idx: number; picks: Record<number, number>; order?: number[]; shuffled?: boolean };
const SESS_KEY = "nls-ai-sessions-v1";
function loadSessions(): Record<string, Session> {
  try { return JSON.parse(localStorage.getItem(SESS_KEY) || "{}"); } catch { return {}; }
}
function saveSession(key: string, s: Session | null) {
  const all = loadSessions();
  if (s) all[key] = s; else delete all[key];
  localStorage.setItem(SESS_KEY, JSON.stringify(all));
}
const sessionList = (key: string) => (key === "all" ? QUESTIONS : QUESTIONS.filter((q) => `ch-${q.chapter}` === key));
const sessionName = (key: string) => (key === "all" ? "Ôn toàn bộ 200 câu" : `Chương ${key.slice(3)} · ${CHAPTERS[+key.slice(3)]}`);

function StudyHub({ store }: { store: Progress }) {
  const [active, setActive] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Record<string, Session>>({});
  useEffect(() => { if (!active) setSessions(loadSessions()); }, [active]);
  const begin = (key: string, shuffled: boolean) => {
    saveSession(key, { idx: 0, picks: {}, order: makeOrder(sessionList(key).map((q) => q.id), shuffled), shuffled });
    setPending(null);
    setActive(key);
  };
  const drop = (key: string) => { saveSession(key, null); setSessions(loadSessions()); };

  if (active)
    return (
      <div className="space-y-3">
        <button onClick={() => setActive(null)} className="group inline-flex items-center gap-1 text-sm text-primary">
          <ChevronLeft className="h-4 w-4 transition-transform duration-300 ease-spring group-hover:-translate-x-1" /> Chọn chương
        </button>
        <p className="font-display text-xl font-bold">{sessionName(active)}</p>
        <StudyView key={active} store={store} list={sessionList(active)} storageKey={active} />
      </div>
    );

  const ans = store.progress.answered;
  const keys = Object.keys(sessions).filter((k) => Object.keys(sessions[k]!.picks).length > 0);
  return (
    <div className="space-y-7">
      {keys.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-xl font-bold">Làm tiếp từ lần trước</h2>
          {keys.map((k, i) => {
            const s = sessions[k]!; const list = sessionList(k);
            const done = Object.keys(s.picks).length;
            const right = list.filter((q) => s.picks[q.id] === q.a).length;
            return (
              <div key={k} className={`${card} animate-rise p-4`} style={stagger(i)}>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">
                      {sessionName(k)}
                      {s.shuffled && <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground">trộn</span>}
                    </p>
                    <p className="text-sm text-muted-foreground">Đã làm {done}/{list.length} câu · đúng {right} · sai {done - right}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button onClick={() => setActive(k)} className={`${btnPrimary} px-4 py-2`}><Play className="h-3.5 w-3.5 fill-current" /> Làm tiếp</button>
                    <button onClick={() => drop(k)} className={`${btnGhost} px-3 py-2`}>Bỏ</button>
                  </div>
                </div>
                <Bar value={(done / list.length) * 100} />
              </div>
            );
          })}
        </section>
      )}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className={`${card} ${lift} animate-rise p-5`} style={stagger(0)}>
          <p className="text-xs font-bold tracking-widest text-accent uppercase">Ôn tổng hợp</p>
          <h3 className="mt-2 font-semibold">Toàn bộ 200 câu</h3>
          <p className="mt-2 text-sm text-muted-foreground">Đã làm đúng {Object.values(ans).filter(Boolean).length} câu</p>
          <ChapterButtons k="all" has={keys.includes("all")} onNew={setPending} onResume={setActive} label="Ôn tất cả" />
        </div>
        {Object.entries(CHAPTERS).map(([c, name], i) => {
          const qs = QUESTIONS.filter((q) => q.chapter === +c);
          const right = qs.filter((q) => ans[q.id] === true).length;
          const k = `ch-${c}`;
          return (
            <div key={c} className={`${card} ${lift} flex animate-rise flex-col p-5`} style={stagger(i + 1)}>
              <p className="text-xs font-bold tracking-widest text-accent uppercase">Chương {c}</p>
              <h3 className="mt-2 font-semibold">{name}</h3>
              <p className="mt-2 mb-2 text-sm text-muted-foreground">{qs.length} câu · đã làm đúng {right}</p>
              <div className="mt-auto"><Bar value={(right / qs.length) * 100} /></div>
              <ChapterButtons k={k} has={keys.includes(k)} onNew={setPending} onResume={setActive} label={`Ôn chương ${c}`} />
            </div>
          );
        })}
      </section>
      <ModePicker pending={pending} hasOld={!!pending && keys.includes(pending)} onClose={() => setPending(null)} onPick={(s) => pending && begin(pending, s)} />
    </div>
  );
}

function ModePicker({ pending, hasOld, onClose, onPick }: { pending: string | null; hasOld: boolean; onClose: () => void; onPick: (shuffled: boolean) => void }) {
  const opts = [
    { s: false, icon: ListOrdered, title: "Làm tuần tự", desc: "Đi lần lượt từ câu đầu tới câu cuối, đúng thứ tự trong đề cương." },
    { s: true, icon: Shuffle, title: "Trộn ngẫu nhiên", desc: "Đảo thứ tự câu hỏi để kiểm tra xem bạn đã thật sự nhớ chưa." },
  ];
  return (
    <Dialog open={!!pending} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Bạn muốn ôn theo cách nào?</DialogTitle>
          <DialogDescription>{pending ? sessionName(pending) : ""}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          {opts.map((o, i) => {
            const I = o.icon;
            return (
              <button key={String(o.s)} onClick={() => onPick(o.s)} className={`group flex animate-rise items-start gap-3 rounded-xl border-2 bg-card p-4 text-left transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:border-primary hover:shadow-lift active:scale-[0.98]`} style={stagger(i + 1)}>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary transition-transform duration-500 ease-spring group-hover:rotate-[-8deg] group-hover:scale-110">
                  <I className="h-5 w-5" />
                </span>
                <span>
                  <span className="block font-semibold">{o.title}</span>
                  <span className="mt-0.5 block text-sm text-muted-foreground">{o.desc}</span>
                </span>
                <ArrowRight className="ml-auto h-4 w-4 shrink-0 self-center text-muted-foreground transition-all duration-300 ease-spring group-hover:translate-x-1 group-hover:text-primary" />
              </button>
            );
          })}
        </div>
        {hasOld && <p className="text-center text-xs text-muted-foreground">Phần đang làm dở của mục này sẽ được thay bằng lượt mới.</p>}
      </DialogContent>
    </Dialog>
  );
}

function ChapterButtons({ k, has, onNew, onResume, label }: { k: string; has: boolean; onNew: (k: string) => void; onResume: (k: string) => void; label: string }) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <button onClick={() => onNew(k)} className={`${btnPrimary} px-4 py-2 text-sm`}>{label}</button>
      {has && <button onClick={() => onResume(k)} className={`${btnGhost} px-4 py-2 text-sm`}><Play className="h-3 w-3 fill-current" /> Có phần ôn dở</button>}
    </div>
  );
}

type StudyState = { idx: number; picks: Record<number, number>; order: number[]; shuffled: boolean };

function StudyView({ store, list, storageKey, onCorrect }: { store: Progress; list: Question[]; storageKey?: string; onCorrect?: (id: number) => void }) {
  // Only rendered after a click, never during SSR, so reading storage here is safe.
  const [st, setSt] = useState<StudyState>(() => {
    const ids = list.map((q) => q.id);
    const s = storageKey && typeof window !== "undefined" ? loadSessions()[storageKey] : undefined;
    const order = s?.order && s.order.length === ids.length && s.order.every((id) => ids.includes(id)) ? s.order : ids;
    return { idx: s && s.idx > 0 && s.idx < order.length ? s.idx : 0, picks: s?.picks ?? {}, order, shuffled: !!s?.shuffled };
  });
  const byId = useMemo(() => new Map(list.map((q) => [q.id, q])), [list]);
  const update = (next: StudyState) => {
    setSt(next);
    if (storageKey) saveSession(storageKey, next);
  };
  const { idx, picks, order } = st;
  const q = byId.get(order[Math.min(idx, order.length - 1)] ?? -1);
  if (!q) return null;
  const picked = picks[q.id] ?? null;
  const pick = (i: number) => {
    if (picked !== null) return;
    update({ ...st, picks: { ...picks, [q.id]: i } });
    store.record(q.id, i === q.a);
    if (i === q.a) onCorrect?.(q.id);
  };
  const move = (i: number) => update({ ...st, idx: i });
  const restartShuffled = () => update({ idx: 0, picks: {}, order: shuffle(list.map((x) => x.id)), shuffled: true });
  const doneCount = Object.keys(picks).length;
  const rightCount = order.filter((id) => picks[id] !== undefined && picks[id] === byId.get(id)?.a).length;

  return (
    <div className={`${card} p-5 md:p-7`}>
      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
        <span className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-muted-foreground">
          {st.shuffled ? <Shuffle className="h-3 w-3" /> : <ListOrdered className="h-3 w-3" />}
          {st.shuffled ? "Trộn ngẫu nhiên" : "Tuần tự"}
        </span>
        <span className="rounded-full bg-success-soft px-2.5 py-1 font-medium text-success tabular-nums">Đúng {rightCount}</span>
        <span className="rounded-full bg-danger-soft px-2.5 py-1 font-medium text-destructive tabular-nums">Sai {doneCount - rightCount}</span>
      </div>
      <div key={`${q.id}-${order.length}-${st.shuffled}-${doneCount === 0}`} className="animate-rise">
        <QHead q={q} idx={idx} total={order.length} />
        <Options q={q} picked={picked} onPick={pick} reveal={picked !== null} />
      </div>
      {picked !== null && (
        <div className="mt-4 animate-rise space-y-3">
          <p className={`font-semibold ${picked === q.a ? "text-success" : "text-destructive"}`}>
            {picked === q.a ? "✓ Chính xác!" : `✗ Chưa đúng — đáp án đúng là ${"ABCD"[q.a]}.`}
          </p>
          {picked !== q.a && (
            <div className="flex flex-col gap-2 rounded-xl border border-dashed p-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">Muốn làm lại cho chắc? Bắt đầu lại từ câu đầu với thứ tự mới.</p>
              <button onClick={restartShuffled} className={`${btnGhost} group shrink-0 px-3.5 py-2 text-sm`}>
                <Shuffle className="h-4 w-4 transition-transform duration-500 ease-spring group-hover:rotate-180" /> Làm lại từ đầu & trộn câu
              </button>
            </div>
          )}
        </div>
      )}
      <div className="mt-6 flex justify-between gap-3">
        <button disabled={idx === 0} onClick={() => move(idx - 1)} className={`${btnGhost} group px-4 py-2.5`}>
          <ChevronLeft className="h-4 w-4 transition-transform duration-300 ease-spring group-hover:-translate-x-0.5" /> Câu trước đó
        </button>
        <button disabled={idx >= order.length - 1} onClick={() => move(idx + 1)} className={`${btnPrimary} group px-4 py-2.5`}>
          Câu tiếp theo <ChevronRight className="h-4 w-4 transition-transform duration-300 ease-spring group-hover:translate-x-0.5" />
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
      <div className="group relative">
        <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
        <input autoFocus value={k} onChange={(e) => setK(e.target.value)} placeholder="Gõ từ khoá, ví dụ: mật khẩu, prompt, NotebookLM…" className="w-full rounded-2xl border-2 bg-card py-4 pr-4 pl-12 shadow-soft transition-all duration-300 ease-spring outline-none focus:border-primary focus:shadow-lift" />
      </div>
      {k && <p className="text-sm text-muted-foreground">{res.length} kết quả{res.length === 50 ? " (hiển thị 50 đầu tiên)" : ""}</p>}
      {res.map((q, i) => (
        <div key={q.id} className="animate-rise rounded-xl border bg-card p-4" style={stagger(i)}>
          <p className="font-medium"><span className="font-display text-primary">Câu {q.id}.</span> {q.q}</p>
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
      <div className={`${card} mx-auto max-w-md p-6 text-center`}>
        <Trophy className="mx-auto h-12 w-12 animate-pop text-accent" />
        <h2 className="mt-3 font-display text-2xl font-bold">Gameshow thi thử</h2>
        <p className="mt-1 text-sm text-muted-foreground">Câu hỏi được trộn ngẫu nhiên. Đạt từ 8 điểm để nhận pháo hoa!</p>
        <div className="mt-5 grid grid-cols-2 gap-3 text-left text-sm">
          <label>Số câu
            <select value={count} onChange={(e) => { setCount(+e.target.value); setMins(+e.target.value); }} className="mt-1 w-full rounded-lg border bg-background p-2 transition-colors focus:border-primary focus:outline-none">
              {[20, 40, 60, 100, 200].map((n) => <option key={n}>{n}</option>)}
            </select>
          </label>
          <label>Thời gian (phút)
            <input type="number" min={1} value={mins} onChange={(e) => setMins(Math.max(1, +e.target.value))} className="mt-1 w-full rounded-lg border bg-background p-2 transition-colors focus:border-primary focus:outline-none" />
          </label>
        </div>
        <button onClick={() => { setQs(shuffle(QUESTIONS).slice(0, count)); setAns({}); setDone(false); setCur(0); setLeft(mins * 60); }} className="mt-6 w-full rounded-xl bg-accent py-3 font-semibold text-accent-foreground transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:shadow-lift active:scale-[0.98]">
          Bắt đầu thi
        </button>
      </div>
    );

  const correct = qs.filter((q) => ans[q.id] === q.a).length;
  const q = qs[cur] as Question;
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");

  return (
    <div className="space-y-4">
      <div className={`${card} flex items-center justify-between p-4`}>
        {done ? (
          <div className="animate-rise">
            <div className="font-display text-3xl font-bold text-primary">{(Math.round((correct / qs.length) * 100) / 10).toFixed(1)} điểm</div>
            <div className="text-sm text-muted-foreground">Đúng {correct}/{qs.length} câu</div>
          </div>
        ) : (
          <div className={`flex items-center gap-2 font-display text-2xl font-bold tabular-nums ${left < 60 ? "text-destructive" : ""}`}>
            <Timer className={`h-5 w-5 ${left < 60 ? "animate-pulse" : "text-primary"}`} /> {mm}:{ss}
          </div>
        )}
        {done ? (
          <button onClick={() => setQs(null)} className={`${btnPrimary} px-4 py-2`}>Thi lại</button>
        ) : (
          <button onClick={() => confirm(`Nộp bài? Đã làm ${Object.keys(ans).length}/${qs.length} câu.`) && submit()} className="rounded-xl bg-accent px-4 py-2 font-semibold text-accent-foreground transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:shadow-lift active:scale-[0.97]">Nộp bài</button>
        )}
      </div>
      <div className={`${card} p-5 md:p-7`}>
        <div key={q.id} className="animate-rise">
          <QHead q={q} idx={cur} total={qs.length} />
          <Options q={q} picked={ans[q.id] ?? null} onPick={(i) => !done && setAns({ ...ans, [q.id]: i })} reveal={done} />
        </div>
        <div className="mt-6 flex justify-between">
          <button disabled={cur === 0} onClick={() => setCur(cur - 1)} className={`${btnGhost} px-4 py-2.5`}><ChevronLeft className="h-4 w-4" /> Trước</button>
          <button disabled={cur === qs.length - 1} onClick={() => setCur(cur + 1)} className={`${btnPrimary} px-4 py-2.5`}>Sau <ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {qs.map((x, i) => {
          let st = x.id in ans ? "bg-secondary border-primary" : "bg-card";
          if (done) st = ans[x.id] === x.a ? "bg-success-soft border-success" : "bg-danger-soft border-destructive";
          return <button key={x.id} onClick={() => setCur(i)} className={`h-9 w-9 rounded-lg border text-xs font-medium tabular-nums transition-all duration-200 ease-spring hover:-translate-y-0.5 hover:border-primary ${st} ${i === cur ? "ring-2 ring-ring" : ""}`}>{i + 1}</button>;
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
      <div className={`${card} p-10 text-center`}>
        <p className="animate-pop text-4xl">🎉</p>
        <p className="mt-2 font-semibold">Chưa có câu sai nào cần ôn lại.</p>
        <p className="text-sm text-muted-foreground">Những câu trả lời sai sẽ tự động được lưu tại đây.</p>
      </div>
    );
  if (snapshot)
    return (
      <div className="space-y-3">
        <button onClick={() => setSnapshot(null)} className="group inline-flex items-center gap-1 text-sm text-primary">
          <ChevronLeft className="h-4 w-4 transition-transform duration-300 ease-spring group-hover:-translate-x-1" /> Danh sách câu sai
        </button>
        <StudyView store={store} list={list} />
        <p className="text-center text-xs text-muted-foreground">Trả lời đúng sẽ tự xoá câu khỏi danh sách câu sai.</p>
      </div>
    );
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-bold">{list.length} câu cần ôn lại</h2>
        <button onClick={() => setSnapshot([...store.progress.wrong])} className={`${btnPrimary} px-4 py-2`}>Ôn lại ngay</button>
      </div>
      {list.map((q, i) => (
        <div key={q.id} className="animate-rise rounded-xl border bg-card p-4" style={stagger(i)}>
          <p className="font-medium"><span className="font-display text-destructive">Câu {q.id}.</span> {q.q}</p>
          <p className="mt-2 rounded-lg bg-success-soft p-2.5 text-sm"><b>{"ABCD"[q.a]}.</b> {q.o[q.a]}</p>
          <button onClick={() => store.removeWrong(q.id)} className="mt-2 text-xs text-muted-foreground transition-colors hover:text-foreground">Đánh dấu đã thuộc</button>
        </div>
      ))}
    </div>
  );
}
