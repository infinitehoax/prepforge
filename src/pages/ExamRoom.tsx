import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Flag,
  ChevronLeft,
  ChevronRight,
  Send,
  X,
  AlertTriangle,
} from "lucide-react";
import { useExamStore } from "@/store/useExamStore";
import { getQuestions, saveExamResult } from "@/db/queries";
import { getSubjectById } from "@/db/subjects";
import { QuestionCard } from "@/components/QuestionCard";
import { Timer } from "@/components/Timer";
import type { AnswerOption } from "@/types";

export function ExamRoom() {
  const navigate = useNavigate();
  const {
    config,
    questions,
    currentIndex,
    answers,
    flagged,
    startExam,
    selectAnswer,
    goNext,
    goPrev,
    goToQuestion,
    toggleFlag,
    submitExam,
    setResultId,
    examStartTime,
  } = useExamStore();

  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);

  // Redirect if no config
  useEffect(() => {
    if (!config) {
      navigate("/select");
      return;
    }

    (async () => {
      try {
        const qs = await getQuestions(
          config.examType,
          config.subjects,
          config.year,
          config.examType === "JAMB" ? 40 : 50
        );
        startExam(qs);
      } catch (e) {
        console.error("Failed to load questions:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = useCallback(async () => {
    if (!config) return;
    const userAnswers = submitExam();
    const score = userAnswers.filter((a) => a.isCorrect).length;
    const timeTaken = examStartTime
      ? Math.floor((Date.now() - examStartTime) / 1000)
      : 0;

    try {
      const id = await saveExamResult({
        examType: config.examType,
        subjects: config.subjects,
        mode: config.mode,
        year: config.year,
        totalQuestions: questions.length,
        score,
        timeTakenSeconds: timeTaken,
        completedAt: new Date().toISOString(),
        answers: userAnswers,
      });
      setResultId(id);
      navigate(`/result/${id}`);
    } catch (e) {
      console.error("Failed to save result:", e);
      navigate(`/result/0`);
    }
  }, [config, submitExam, examStartTime, questions.length, setResultId, navigate]);

  if (!config) return null;

  if (loading) {
    return (
      <div
        className="h-screen flex items-center justify-center"
        style={{ background: "var(--bg-primary)" }}
      >
        <div className="text-center">
          <div
            className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-3"
            style={{ borderColor: "var(--accent-blue)", borderTopColor: "transparent" }}
          />
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            Loading questions...
          </p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div
        className="h-screen flex items-center justify-center"
        style={{ background: "var(--bg-primary)" }}
      >
        <div className="text-center max-w-sm">
          <p
            className="text-lg font-bold mb-2"
            style={{ fontFamily: "'Syne', sans-serif", color: "var(--text-primary)" }}
          >
            No Questions Found
          </p>
          <p
            className="text-sm mb-4"
            style={{ color: "var(--text-secondary)" }}
          >
            No questions are available for your selected subjects and year. Try a different year.
          </p>
          <button
            onClick={() => navigate("/select")}
            className="px-4 py-2 rounded-xl text-sm font-medium"
            style={{ background: "var(--accent-blue)", color: "white" }}
          >
            Back to Setup
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const showAnswer =
    config.mode === "study" && answers[currentQuestion.id] != null;

  const subjectName = getSubjectById(currentQuestion.subjectId)?.name || currentQuestion.subjectId;

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Top bar */}
      <header
        className="flex items-center justify-between px-6 py-3 flex-shrink-0 border-b"
        style={{
          background: "var(--bg-secondary)",
          borderColor: "var(--border)",
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowConfirm(true)}
            className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            style={{ color: "var(--text-muted)" }}
          >
            <X size={16} />
          </button>
          <div
            className="h-4 w-px"
            style={{ background: "var(--border)" }}
          />
          <div>
            <span
              className="font-bold text-sm"
              style={{ fontFamily: "'Syne', sans-serif", color: "var(--text-primary)" }}
            >
              {config.examType}
            </span>
            <span
              className="text-xs ml-1.5"
              style={{ color: "var(--text-muted)" }}
            >
              {config.year} · {config.mode === "mock" ? "Mock Exam" : "Study Mode"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {answeredCount}/{questions.length} answered
          </span>
          <Timer onExpire={handleSubmit} />
        </div>
      </header>

      {/* Subject tabs */}
      <div
        className="flex items-center gap-1 px-6 py-2 border-b flex-shrink-0 overflow-x-auto"
        style={{
          background: "var(--bg-secondary)",
          borderColor: "var(--border)",
        }}
      >
        {config.subjects.map((subId) => {
          const sub = getSubjectById(subId);
          const subQuestions = questions.filter((q) => q.subjectId === subId);
          const subAnswered = subQuestions.filter((q) => answers[q.id] != null).length;
          const isCurrent = currentQuestion.subjectId === subId;

          return (
            <button
              key={subId}
              onClick={() => {
                const firstIdx = questions.findIndex((q) => q.subjectId === subId);
                if (firstIdx >= 0) goToQuestion(firstIdx);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all"
              style={{
                background: isCurrent
                  ? `${sub?.color || "var(--accent-blue)"}22`
                  : "transparent",
                color: isCurrent
                  ? sub?.color || "var(--accent-blue)"
                  : "var(--text-muted)",
                border: `1px solid ${isCurrent ? (sub?.color || "var(--accent-blue)") + "44" : "transparent"}`,
              }}
            >
              <span>{sub?.icon}</span>
              {sub?.name.split(" ").slice(-1)[0]}
              <span
                className="font-mono"
                style={{ opacity: 0.7 }}
              >
                {subAnswered}/{subQuestions.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main: question + navigator */}
      <div className="flex flex-1 overflow-hidden">
        {/* Question area */}
        <main className="flex-1 overflow-y-auto px-8 py-6">
          <div className="max-w-2xl mx-auto">
            <QuestionCard
              key={currentQuestion.id}
              question={currentQuestion}
              selectedOption={(answers[currentQuestion.id] as AnswerOption) || null}
              onSelect={(opt) => selectAnswer(currentQuestion.id, opt)}
              showAnswer={showAnswer}
              questionNumber={currentIndex + 1}
              totalQuestions={questions.length}
            />

            {/* Nav buttons */}
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={goPrev}
                disabled={currentIndex === 0}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-30"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  color: "var(--text-secondary)",
                }}
              >
                <ChevronLeft size={15} />
                Previous
              </button>

              <button
                onClick={() => toggleFlag(currentQuestion.id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all"
                style={{
                  background: flagged.has(currentQuestion.id)
                    ? "rgba(245,158,11,0.15)"
                    : "var(--bg-card)",
                  border: `1px solid ${
                    flagged.has(currentQuestion.id)
                      ? "rgba(245,158,11,0.4)"
                      : "var(--border)"
                  }`,
                  color: flagged.has(currentQuestion.id)
                    ? "var(--accent-amber)"
                    : "var(--text-muted)",
                }}
              >
                <Flag size={13} />
                {flagged.has(currentQuestion.id) ? "Flagged" : "Flag"}
              </button>

              {currentIndex < questions.length - 1 ? (
                <button
                  onClick={goNext}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: "var(--accent-blue)",
                    color: "white",
                  }}
                >
                  Next
                  <ChevronRight size={15} />
                </button>
              ) : (
                <button
                  onClick={() => setShowConfirm(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                  style={{
                    background: "var(--accent-green)",
                    color: "white",
                  }}
                >
                  <Send size={13} />
                  Submit
                </button>
              )}
            </div>
          </div>
        </main>

        {/* Right panel: question navigator */}
        <aside
          className="w-52 flex-shrink-0 border-l overflow-y-auto px-4 py-5"
          style={{
            background: "var(--bg-secondary)",
            borderColor: "var(--border)",
          }}
        >
          <div
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: "var(--text-muted)" }}
          >
            {subjectName}
          </div>

          {/* Legend */}
          <div className="space-y-1 mb-4 text-xs" style={{ color: "var(--text-muted)" }}>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-500/30 border border-blue-500" />
              Answered
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-amber-500/30 border border-amber-500" />
              Flagged
            </div>
          </div>

          <div className="grid grid-cols-5 gap-1">
            {questions.map((q, idx) => {
              const isAnswered = answers[q.id] != null;
              const isFlagged = flagged.has(q.id);
              const isCurrent = idx === currentIndex;

              return (
                <button
                  key={q.id}
                  onClick={() => goToQuestion(idx)}
                  className={`q-nav-btn ${isCurrent ? "current" : ""} ${isFlagged && !isCurrent ? "flagged" : ""} ${isAnswered && !isCurrent && !isFlagged ? "answered" : ""}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Submit button in sidebar too */}
          <button
            onClick={() => setShowConfirm(true)}
            className="w-full mt-5 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
            style={{
              background: answeredCount === questions.length ? "var(--accent-green)" : "var(--bg-card)",
              border: `1px solid ${answeredCount === questions.length ? "var(--accent-green)" : "var(--border)"}`,
              color: answeredCount === questions.length ? "white" : "var(--text-secondary)",
            }}
          >
            <Send size={13} />
            Submit Exam
          </button>

          <p className="text-xs text-center mt-2" style={{ color: "var(--text-muted)" }}>
            {questions.length - answeredCount} unanswered
          </p>
        </aside>
      </div>

      {/* Confirm dialog */}
      {showConfirm && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: "rgba(2,6,23,0.85)" }}
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="rounded-2xl p-6 max-w-sm w-full mx-4 animate-in"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={18} style={{ color: "var(--accent-amber)" }} />
              <h3
                className="font-bold text-base"
                style={{ fontFamily: "'Syne', sans-serif", color: "var(--text-primary)" }}
              >
                Submit Exam?
              </h3>
            </div>
            <p className="text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
              You have answered{" "}
              <strong style={{ color: "var(--text-primary)" }}>
                {answeredCount} of {questions.length}
              </strong>{" "}
              questions.
            </p>
            {questions.length - answeredCount > 0 && (
              <p className="text-sm mb-4" style={{ color: "var(--accent-amber)" }}>
                ⚠️ {questions.length - answeredCount} questions are unanswered.
              </p>
            )}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  color: "var(--text-secondary)",
                }}
              >
                Continue
              </button>
              <button
                onClick={() => {
                  setShowConfirm(false);
                  handleSubmit();
                }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                style={{ background: "var(--accent-green)", color: "white" }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
