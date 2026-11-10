import { useEffect, useState } from "react";
import { CalendarClock } from "lucide-react";
import { remaining } from "@/lib/countdown";

const UNITS = [
  { k: "d", label: "Ngày" },
  { k: "h", label: "Giờ" },
  { k: "m", label: "Phút" },
  { k: "s", label: "Giây" },
] as const;

export function ExamCountdown() {
  // Starts empty so server and first client render match; ticks only after mount.
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const r = now === null ? null : remaining(now);

  return (
    <div className="glass w-full rounded-2xl p-4 md:w-auto md:min-w-[300px] md:p-5">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="flex items-center gap-1.5 font-semibold tracking-widest uppercase opacity-90">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          Đếm ngược ngày thi
        </span>
        <span className="flex items-center gap-1 opacity-80">
          <CalendarClock className="h-3.5 w-3.5" /> 12/11 · 10:45
        </span>
      </div>

      {r?.done ? (
        <p className="mt-4 text-center font-display text-xl font-bold italic">Chúc bạn thi thật tốt! 🍀</p>
      ) : (
        <div className="mt-3 grid grid-cols-4 gap-2">
          {UNITS.map((u, i) => {
            const v = r ? String(r[u.k]).padStart(2, "0") : "--";
            return (
              <div key={u.k} className="relative flex flex-col items-center">
                <div className="flex h-14 w-full items-center justify-center overflow-hidden rounded-xl bg-hero-fg/10 md:h-16">
                  <span key={v} className="animate-tick font-display text-3xl font-bold tabular-nums md:text-4xl">
                    {v}
                  </span>
                </div>
                <span className="mt-1.5 text-[10px] font-medium tracking-[0.18em] uppercase opacity-75">{u.label}</span>
                {i < 3 && <span className="absolute top-4 -right-1.5 text-lg opacity-40 md:top-5">:</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
