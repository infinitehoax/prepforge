import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Trophy,
  Clock,
  Target,
  BookOpen,
  ArrowLeft,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Minus,
} from "lucide-react";
import { getResultById } from "@/db/queries";
import { getSubjectById } from "@/db/subjects";
import type { Question, ExamResult } from "@/types";

interface FullResult {
  result: ExamResult;
  questions: Question[];
  answers: Record<number, string | null>;
}

export function ResultSummary() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<FullResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedQ, setExpandedQ] = useState<number | null>(null);

  useEffect(() => {
    if (!id || id === "0") {
      setLoading(false);
      return;
    }
    getResultById(Number(id))
      .then((r) => setData(r))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div
        className="h-screen flex items-center justify-center"
        style={{ background: "var(--bg-primary)" }}
      >
        <div
          className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "var(--accent-blue)", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  if (!data) {
    return (
      <div
        className="h-screen flex items-center justify-center"
        style={{ background: "var(--bg-primary)" }}
      >
        <div className="text-center">
          <p style={{ color: "var(--text-secondary)" }}>Result not found.</p>
          <button
            onClick={() => navigate("/")}
            className="mt-3 px-4 py-2 rounded-xl text-sm"
            style={{ background: "var(--accent-blue)", color: "white" }}
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const { result, questions, answers } = data;
  const pct = Math.round(result.percentage);
  const timeMins = Math.floor(result.timeTakenSeconds / 60);
  const timeSecs = result.timeTakenSeconds % 60;

  const scoreColor =
    pct >= 70
      ? "var(--accent-green)"
      : pct >= 50
      ? "var(--accent-amber)"
      : "var(--accent-rose)";

  const scoreMsg =
    pct >= 70
      ? "Excellent! 🎉"
      : pct >= 50
      ? "Good effort! 💪"
      : "Keep practicing! 📚";

  // Per-subject stats
  const subjectStats = result.subjects.split(",").map((subId) => {
    const subQuestions = questions.filter((q) => q.subjectId === subId);
    const correct = subQuestions.filter(
      (q) => answers[q.id] === q.correctAnswer
    ).length;
    const sub = getSubjectById(subId);
    return {
      subId,
      name: sub?.name || subId,
      icon: sub?.icon || "📚",
      color: sub?.color || "var(--accent-blue)",
      total: subQuestions.length,
      correct,
      pct: subQuestions.length ? Math.round((correct / subQuestions.length) * 100) : 0,
    };
  });

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-10 flex items-center justify-between px-8 py-4 border-b"
        style={{
          background: "var(--bg-secondary)",
          borderColor: "var(--border)",
        }}
      >
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm font-medium transition-all hover:opacity-80"
          style={{ color: "var(--text-secondary)" }}
        >
          <ArrowLeft size={15} />
          Dashboard
        </button>
        <button
          onClick={() => navigate("/select")}
          className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
          style={{ background: "var(--accent-blue)", color: "white" }}
        >
          Try Again
        </button>
      </header>

      <div className="max-w-3xl mx-auto px-8 py-8 animate-in">
        {/* Score hero */}
        <div className="text-center mb-10">
          {/* Score ring */}
          <div className="relative inline-flex items-center justify-center mb-4">
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="var(--border)" strokeWidth="8" />
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke={scoreColor}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 52}`}
                strokeDashoffset={`${2 * Math.PI * 52 * (1 - pct / 100)}`}
                transform="rotate(-90 60 60)"
                className="score-ring"
              />
            </svg>
            <div className="absolute text-center">
              <div
                className="text-2xl font-bold"
                style={{ fontFamily: "'Syne', sans-serif", color: scoreColor }}
              >
                {pct}%
              </div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                {result.score}/{result.totalQuestions}
              </div>
            </div>
          </div>

          <h2
            className="text-xl font-bold mb-1"
            style={{ fontFamily: "'Syne', sans-serif", color: "var(--text-primary)" }}
          >
            {scoreMsg}
          </h2>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {result.examType} · {result.year} · {result.mode === "mock" ? "Mock Exam" : "Study Mode"}
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            {
              icon: Target,
              label: "Score",
              value: `${result.score}/${result.totalQuestions}`,
              color: scoreColor,
            },
            {
              icon: Clock,
              label: "Time Taken",
              value: `${timeMins}m ${String(timeSecs).padStart(2, "0")}s`,
              color: "var(--accent-blue)",
            },
            {
              icon: Trophy,
              label: "Accuracy",
              value: `${pct}%`,
              color: scoreColor,
            },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="glass-card p-4 text-center">
                <Icon
                  size={18}
                  className="mx-auto mb-2"
                  style={{ color: s.color }}
                />
                <div
                  className="text-lg font-bold mb-0.5"
                  style={{ fontFamily: "'Syne', sans-serif", color: s.color }}
                >
                  {s.value}
                </div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {s.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Subject breakdown */}
        {subjectStats.length > 1 && (
          <div className="glass-card p-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen size={14} style={{ color: "var(--accent-blue)" }} />
              <span
                className="text-sm font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Subject Breakdown
              </span>
            </div>
            <div className="space-y-3">
              {subjectStats.map((s) => (
                <div key={s.subId}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span>{s.icon}</span>
                      <span
                        className="text-sm"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {s.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs font-mono"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {s.correct}/{s.total}
                      </span>
                      <span
                        className="text-sm font-bold w-12 text-right"
                        style={{ color: s.color, fontFamily: "'Syne', sans-serif" }}
                      >
                        {s.pct}%
                      </span>
                    </div>
                  </div>
                  <div
                    className="h-1.5 rounded-full overflow-hidden"
                    style={{ background: "var(--border)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${s.pct}%`, background: s.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Question review */}
        {questions.length > 0 && (
          <div>
            <div
              className="text-sm font-semibold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              Question Review
            </div>
            <div className="space-y-2">
              {questions.map((q, idx) => {
                const userAnswer = answers[q.id] || null;
                const isCorrect = userAnswer === q.correctAnswer;
                const isSkipped = userAnswer === null;
                const isOpen = expandedQ === q.id;

                return (
                  <div key={q.id} className="glass-card overflow-hidden">
                    <button
                      className="w-full flex items-center gap-3 p-4 text-left"
                      onClick={() => setExpandedQ(isOpen ? null : q.id)}
                    >
                      {isSkipped ? (
                        <Minus
                          size={15}
                          className="flex-shrink-0"
                          style={{ color: "var(--text-muted)" }}
                        />
                      ) : isCorrect ? (
                        <CheckCircle
                          size={15}
                          className="flex-shrink-0"
                          style={{ color: "var(--accent-green)" }}
                        />
                      ) : (
                        <XCircle
                          size={15}
                          className="flex-shrink-0"
                          style={{ color: "var(--accent-rose)" }}
                        />
                      )}
                      <span
                        className="text-xs font-mono w-6 flex-shrink-0"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {idx + 1}
                      </span>
                      <span
                        className="flex-1 text-sm selectable line-clamp-1"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {q.questionText}
                      </span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!isSkipped && (
                          <span
                            className="text-xs font-mono"
                            style={{
                              color: isCorrect ? "var(--accent-green)" : "var(--accent-rose)",
                            }}
                          >
                            {isCorrect ? "✓" : `✗ → ${q.correctAnswer}`}
                          </span>
                        )}
                        {isOpen ? (
                          <ChevronUp size={13} style={{ color: "var(--text-muted)" }} />
                        ) : (
                          <ChevronDown size={13} style={{ color: "var(--text-muted)" }} />
                        )}
                      </div>
                    </button>

                    {isOpen && (
                      <div
                        className="px-4 pb-4 text-sm selectable"
                        style={{ borderTop: "1px solid var(--border)" }}
                      >
                        <div className="pt-3 space-y-2">
                          {(["A", "B", "C", "D"] as const).map((opt) => {
                            const label =
                              opt === "A"
                                ? q.optionA
                                : opt === "B"
                                ? q.optionB
                                : opt === "C"
                                ? q.optionC
                                : q.optionD;
                            const isCorrectOpt = opt === q.correctAnswer;
                            const isUserOpt = opt === userAnswer;
                            return (
                              <div
                                key={opt}
                                className="flex items-start gap-2 p-2 rounded-lg text-xs"
                                style={{
                                  background: isCorrectOpt
                                    ? "rgba(34,197,94,0.08)"
                                    : isUserOpt
                                    ? "rgba(244,63,94,0.08)"
                                    : "transparent",
                                  color: isCorrectOpt
                                    ? "var(--accent-green)"
                                    : isUserOpt
                                    ? "var(--accent-rose)"
                                    : "var(--text-muted)",
                                }}
                              >
                                <span className="font-bold flex-shrink-0">{opt}.</span>
                                <span>{label}</span>
                              </div>
                            );
                          })}
                          {q.explanation && (
                            <div
                              className="mt-2 p-3 rounded-lg text-xs"
                              style={{
                                background: "rgba(245,158,11,0.07)",
                                border: "1px solid rgba(245,158,11,0.15)",
                                color: "var(--text-secondary)",
                              }}
                            >
                              <strong style={{ color: "var(--accent-amber)" }}>
                                💡 Explanation:{" "}
                              </strong>
                              {q.explanation}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
