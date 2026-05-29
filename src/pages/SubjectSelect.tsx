import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Check, ArrowRight, Info, Lock } from "lucide-react";
import { getSubjectsForExam, EXAM_CONFIG } from "@/db/subjects";
import { getAvailableYears } from "@/db/queries";
import { useExamStore } from "@/store/useExamStore";
import type { ExamType, SubjectId, PracticeMode } from "@/types";

export function SubjectSelect() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setConfig } = useExamStore();

  const [examType, setExamType] = useState<ExamType>(
    (location.state as { examType?: ExamType })?.examType || "JAMB"
  );
  const [mode, setMode] = useState<PracticeMode>("mock");
  const [selectedSubjects, setSelectedSubjects] = useState<SubjectId[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(2023);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [error, setError] = useState("");
  const [isLoadingYears, setIsLoadingYears] = useState(true);

  const config = EXAM_CONFIG[examType];
  const subjects = getSubjectsForExam(examType);

  useEffect(() => {
    setSelectedSubjects([]);
    setError("");
    setIsLoadingYears(true);
    setAvailableYears([]);

    getAvailableYears(examType)
      .then((years) => {
        setAvailableYears(years);
        if (years.length > 0) {
          setSelectedYear(years[0]);
        }
        setIsLoadingYears(false);
      })
      .catch((err) => {
        console.error("Failed to load years:", err);
        setError("Failed to load available years. Please restart the app.");
        setIsLoadingYears(false);
      });
  }, [examType]);

  function toggleSubject(id: SubjectId) {
    setError("");
    if (id === "english" && examType === "JAMB") return; // mandatory

    setSelectedSubjects((prev) => {
      if (prev.includes(id)) {
        return prev.filter((s) => s !== id);
      }
      if (
        config.requiredSubjects &&
        prev.length >= config.requiredSubjects
      ) {
        setError(
          `JAMB requires exactly ${config.requiredSubjects} subjects. Remove one first.`
        );
        return prev;
      }
      return [...prev, id];
    });
  }

  function handleStart() {
    const toUse =
      examType === "JAMB" && !selectedSubjects.includes("english")
        ? ["english" as SubjectId, ...selectedSubjects]
        : selectedSubjects;

    if (examType === "JAMB" && toUse.length !== 4) {
      setError("Select exactly 4 subjects for JAMB (Use of English is mandatory).");
      return;
    }
    if (toUse.length === 0) {
      setError("Please select at least one subject.");
      return;
    }

    setConfig({
      examType,
      subjects: toUse,
      mode,
      year: selectedYear,
      durationSeconds: config.durationMinutes * 60,
    });
    navigate("/exam");
  }

  // Auto-include English for JAMB
  const effectiveSelected =
    examType === "JAMB" && !selectedSubjects.includes("english")
      ? ["english" as SubjectId, ...selectedSubjects]
      : selectedSubjects;

  return (
    <div className="p-8 max-w-4xl animate-in">
      <div className="mb-8">
        <h1
          className="text-2xl font-bold mb-1"
          style={{ fontFamily: "'Syne', sans-serif", color: "var(--text-primary)" }}
        >
          Set Up Your Exam
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          Configure your practice session
        </p>
      </div>

      {/* Step 1: Exam type */}
      <section className="mb-7">
        <label
          className="text-xs font-semibold uppercase tracking-widest mb-3 block"
          style={{ color: "var(--text-muted)" }}
        >
          Step 1 — Exam Type
        </label>
        <div className="grid grid-cols-2 gap-3">
          {(["JAMB", "WAEC"] as ExamType[]).map((type) => (
            <button
              key={type}
              onClick={() => setExamType(type)}
              className="p-4 rounded-xl border text-left transition-all hover:scale-[1.01] active:scale-[0.99]"
              style={{
                background:
                  examType === type
                    ? "rgba(14,165,233,0.12)"
                    : "var(--bg-card)",
                borderColor:
                  examType === type ? "var(--accent-blue)" : "var(--border)",
              }}
            >
              <div
                className="font-bold text-base mb-0.5"
                style={{
                  fontFamily: "'Syne', sans-serif",
                  color:
                    examType === type
                      ? "var(--accent-blue)"
                      : "var(--text-primary)",
                }}
              >
                {type === "JAMB" ? "JAMB UTME" : "WAEC SSCE"}
              </div>
              <div
                className="text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                {EXAM_CONFIG[type].description}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Step 2: Subjects */}
      <section className="mb-7">
        <label
          className="text-xs font-semibold uppercase tracking-widest mb-1 block"
          style={{ color: "var(--text-muted)" }}
        >
          Step 2 — Subjects
        </label>
        {examType === "JAMB" && (
          <div
            className="flex items-center gap-2 text-xs mb-3 p-2.5 rounded-lg"
            style={{
              background: "rgba(14,165,233,0.07)",
              color: "var(--text-secondary)",
              border: "1px solid rgba(14,165,233,0.15)",
            }}
          >
            <Info size={13} />
            Use of English is mandatory. Select 3 more subjects.
          </div>
        )}
        <div className="grid grid-cols-4 gap-2">
          {subjects.map((subject) => {
            const isMandatory =
              subject.id === "english" && examType === "JAMB";
            const isSelected = effectiveSelected.includes(subject.id);

            return (
              <button
                key={subject.id}
                onClick={() => toggleSubject(subject.id)}
                disabled={isMandatory}
                className="p-3 rounded-xl border text-left transition-all hover:scale-[1.01] active:scale-[0.99] relative"
                style={{
                  background: isSelected
                    ? `${subject.color}18`
                    : "var(--bg-card)",
                  borderColor: isSelected ? subject.color : "var(--border)",
                  opacity: isMandatory ? 0.7 : 1,
                }}
              >
                {isMandatory && (
                  <Lock
                    size={10}
                    className="absolute top-2 right-2"
                    style={{ color: "var(--text-muted)" }}
                  />
                )}
                {isSelected && !isMandatory && (
                  <Check
                    size={12}
                    className="absolute top-2 right-2"
                    style={{ color: subject.color }}
                  />
                )}
                <div className="text-lg mb-1">{subject.icon}</div>
                <div
                  className="text-xs font-medium leading-tight"
                  style={{
                    color: isSelected ? subject.color : "var(--text-secondary)",
                  }}
                >
                  {subject.name}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Step 3: Year */}
      <section className="mb-7">
        <label
          className="text-xs font-semibold uppercase tracking-widest mb-3 block"
          style={{ color: "var(--text-muted)" }}
        >
          Step 3 — Year
        </label>
        <div className="flex gap-2 flex-wrap">
          {isLoadingYears ? (
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              Loading years...
            </span>
          ) : availableYears.length === 0 ? (
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              {error ? "Error loading years" : "No years available for this exam type"}
            </span>
          ) : (
            availableYears.map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className="px-4 py-2 rounded-lg text-sm font-mono font-medium transition-all"
                style={{
                  background:
                    selectedYear === year
                      ? "var(--accent-blue)"
                      : "var(--bg-card)",
                  color:
                    selectedYear === year ? "white" : "var(--text-secondary)",
                  border: `1px solid ${
                    selectedYear === year
                      ? "var(--accent-blue)"
                      : "var(--border)"
                  }`,
                }}
              >
                {year}
              </button>
            ))
          )}
        </div>
      </section>

      {/* Step 4: Mode */}
      <section className="mb-8">
        <label
          className="text-xs font-semibold uppercase tracking-widest mb-3 block"
          style={{ color: "var(--text-muted)" }}
        >
          Step 4 — Practice Mode
        </label>
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              {
                key: "mock" as PracticeMode,
                title: "Mock Exam",
                desc: "Timed. No feedback until submission. Simulates real CBT.",
                icon: "⏱️",
                color: "var(--accent-rose)",
              },
              {
                key: "study" as PracticeMode,
                title: "Study Mode",
                desc: "Untimed. See explanations after each answer immediately.",
                icon: "📖",
                color: "var(--accent-green)",
              },
            ] as const
          ).map((m) => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className="p-4 rounded-xl border text-left transition-all"
              style={{
                background:
                  mode === m.key ? `${m.color}18` : "var(--bg-card)",
                borderColor: mode === m.key ? m.color : "var(--border)",
              }}
            >
              <div className="text-xl mb-1">{m.icon}</div>
              <div
                className="font-semibold text-sm mb-0.5"
                style={{
                  color: mode === m.key ? m.color : "var(--text-primary)",
                }}
              >
                {m.title}
              </div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                {m.desc}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Error */}
      {error && (
        <div
          className="mb-4 px-4 py-2.5 rounded-lg text-sm"
          style={{
            background: "rgba(244,63,94,0.1)",
            border: "1px solid rgba(244,63,94,0.3)",
            color: "#fda4af",
          }}
        >
          {error}
        </div>
      )}

      {/* Start button */}
      <button
        onClick={handleStart}
        className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90 active:scale-95"
        style={{ background: "var(--accent-blue)", color: "white" }}
      >
        Begin Exam
        <ArrowRight size={16} />
      </button>
    </div>
  );
}
