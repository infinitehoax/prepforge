import { useEffect, useRef } from "react";
import { Clock } from "lucide-react";
import { useExamStore } from "@/store/useExamStore";

interface TimerProps {
  onExpire: () => void;
}

export function Timer({ onExpire }: TimerProps) {
  const { timeRemainingSeconds, tickTimer, config } = useExamStore();
  const intervalRef = useRef<number | null>(null);
  const hasExpired = useRef(false);

  useEffect(() => {
    if (config?.mode !== "mock") return;

    intervalRef.current = window.setInterval(() => {
      tickTimer();
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [config?.mode, tickTimer]);

  useEffect(() => {
    if (timeRemainingSeconds === 0 && !hasExpired.current && config?.mode === "mock") {
      hasExpired.current = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
      onExpire();
    }
  }, [timeRemainingSeconds, onExpire, config?.mode]);

  if (config?.mode === "study") {
    return (
      <div
        className="flex items-center gap-1.5 text-sm font-mono px-3 py-1.5 rounded-lg"
        style={{
          background: "rgba(34,197,94,0.1)",
          color: "var(--accent-green)",
          border: "1px solid rgba(34,197,94,0.2)",
        }}
      >
        <Clock size={13} />
        Study Mode
      </div>
    );
  }

  const minutes = Math.floor(timeRemainingSeconds / 60);
  const seconds = timeRemainingSeconds % 60;
  const isCritical = timeRemainingSeconds <= 300; // 5 minutes
  const pct = config
    ? (timeRemainingSeconds / config.durationSeconds) * 100
    : 100;

  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-sm"
      style={{
        background: isCritical
          ? "rgba(244,63,94,0.1)"
          : "rgba(14,165,233,0.1)",
        border: `1px solid ${
          isCritical ? "rgba(244,63,94,0.3)" : "rgba(14,165,233,0.2)"
        }`,
      }}
    >
      <Clock
        size={13}
        style={{ color: isCritical ? "var(--accent-rose)" : "var(--accent-blue)" }}
      />
      <span
        className={`font-bold tabular-nums ${isCritical ? "timer-critical" : ""}`}
        style={{ color: isCritical ? "var(--accent-rose)" : "var(--accent-blue)" }}
      >
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </span>
      {/* Mini progress bar */}
      <div
        className="w-16 h-1 rounded-full overflow-hidden"
        style={{ background: "var(--border)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${pct}%`,
            background: isCritical ? "var(--accent-rose)" : "var(--accent-blue)",
          }}
        />
      </div>
    </div>
  );
}
