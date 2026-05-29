import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRecentResults } from "@/db/queries";
import { getSubjectById } from "@/db/subjects";
import type { ExamResult } from "@/types";
import { Clock, ChevronRight, Trophy } from "lucide-react";

export function History() {
  const navigate = useNavigate();
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecentResults(50)
      .then(setResults)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-3xl animate-in">
      <div className="mb-8">
        <h1
          className="text-2xl font-bold mb-1"
          style={{ fontFamily: "'Syne', sans-serif", color: "var(--text-primary)" }}
        >
          Exam History
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          All your past practice sessions
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div
            className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: "var(--accent-blue)", borderTopColor: "transparent" }}
          />
        </div>
      ) : results.length === 0 ? (
        <div
          className="text-center py-16 glass-card"
          style={{ color: "var(--text-muted)" }}
        >
          <Trophy size={32} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
            No history yet
          </p>
          <p className="text-sm mb-4">Complete an exam to see your results here</p>
          <button
            onClick={() => navigate("/select")}
            className="px-4 py-2 rounded-xl text-sm font-medium"
            style={{ background: "var(--accent-blue)", color: "white" }}
          >
            Start Practice
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {results.map((result) => {
            const pct = Math.round(result.percentage);
            const color =
              pct >= 70
                ? "var(--accent-green)"
                : pct >= 50
                ? "var(--accent-amber)"
                : "var(--accent-rose)";
            const subjects = result.subjects
              .split(",")
              .map((s) => getSubjectById(s)?.name || s)
              .join(", ");
            const date = new Date(result.completedAt).toLocaleDateString("en-NG", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });
            const timeMins = Math.floor(result.timeTakenSeconds / 60);

            return (
              <button
                key={result.id}
                onClick={() => navigate(`/result/${result.id}`)}
                className="w-full glass-card p-4 flex items-center gap-4 text-left"
              >
                {/* Score circle */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-base"
                  style={{
                    background: `${color}15`,
                    color,
                    fontFamily: "'Syne', sans-serif",
                    border: `1px solid ${color}30`,
                  }}
                >
                  {pct}%
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {result.examType}
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background:
                          result.mode === "mock"
                            ? "rgba(244,63,94,0.1)"
                            : "rgba(34,197,94,0.1)",
                        color:
                          result.mode === "mock"
                            ? "var(--accent-rose)"
                            : "var(--accent-green)",
                      }}
                    >
                      {result.mode}
                    </span>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {result.year}
                    </span>
                  </div>
                  <p
                    className="text-xs truncate"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {subjects}
                  </p>
                </div>

                {/* Meta */}
                <div className="flex items-center gap-3 flex-shrink-0 text-xs" style={{ color: "var(--text-muted)" }}>
                  <div className="text-right">
                    <div>{date}</div>
                    <div className="flex items-center gap-1 justify-end mt-0.5">
                      <Clock size={10} />
                      {timeMins}m
                    </div>
                  </div>
                  <ChevronRight size={14} />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
