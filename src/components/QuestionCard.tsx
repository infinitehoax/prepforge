import type { Question, AnswerOption } from "@/types";
import { CheckCircle, XCircle, Lightbulb } from "lucide-react";

interface QuestionCardProps {
  question: Question;
  selectedOption: AnswerOption | null;
  onSelect: (option: AnswerOption) => void;
  showAnswer: boolean; // study mode or after submit
  questionNumber: number;
  totalQuestions: number;
}

const OPTIONS: AnswerOption[] = ["A", "B", "C", "D"];

export function QuestionCard({
  question,
  selectedOption,
  onSelect,
  showAnswer,
  questionNumber,
  totalQuestions,
}: QuestionCardProps) {
  const getOptionLabel = (opt: AnswerOption): string => {
    return {
      A: question.optionA,
      B: question.optionB,
      C: question.optionC,
      D: question.optionD,
    }[opt];
  };

  const getOptionClass = (opt: AnswerOption): string => {
    if (!showAnswer) {
      return selectedOption === opt ? "option-selected" : "";
    }
    if (opt === question.correctAnswer) return "option-correct";
    if (opt === selectedOption && opt !== question.correctAnswer) return "option-wrong";
    return "";
  };

  const isCorrect = selectedOption === question.correctAnswer;

  return (
    <div className="flex flex-col gap-5">
      {/* Question header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-mono px-2.5 py-1 rounded-lg"
            style={{
              background: "var(--bg-secondary)",
              color: "var(--text-muted)",
              border: "1px solid var(--border)",
            }}
          >
            Q{questionNumber}/{totalQuestions}
          </span>
          {question.topic && (
            <span
              className="text-xs px-2.5 py-1 rounded-full"
              style={{
                background: "rgba(14,165,233,0.08)",
                color: "var(--text-secondary)",
                border: "1px solid rgba(14,165,233,0.15)",
              }}
            >
              {question.topic}
            </span>
          )}
          <span
            className="text-xs px-2 py-1 rounded-lg"
            style={{
              background: "var(--bg-secondary)",
              color: "var(--text-muted)",
            }}
          >
            {question.examType} {question.year}
          </span>
        </div>
      </div>

      {/* Question text */}
      <div
        className="text-base leading-relaxed selectable"
        style={{ color: "var(--text-primary)", lineHeight: "1.7" }}
      >
        {question.questionText}
      </div>

      {/* Options */}
      <div className="space-y-2.5">
        {OPTIONS.map((opt) => (
          <button
            key={opt}
            className={`option-btn ${getOptionClass(opt)}`}
            onClick={() => !showAnswer && onSelect(opt)}
            disabled={showAnswer && question.correctAnswer !== opt}
          >
            <div className="flex items-start gap-3">
              <span
                className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5"
                style={{
                  background:
                    getOptionClass(opt) === "option-correct"
                      ? "rgba(34,197,94,0.2)"
                      : getOptionClass(opt) === "option-wrong"
                      ? "rgba(244,63,94,0.2)"
                      : getOptionClass(opt) === "option-selected"
                      ? "rgba(14,165,233,0.2)"
                      : "var(--bg-secondary)",
                  color:
                    getOptionClass(opt) === "option-correct"
                      ? "var(--accent-green)"
                      : getOptionClass(opt) === "option-wrong"
                      ? "var(--accent-rose)"
                      : getOptionClass(opt) === "option-selected"
                      ? "var(--accent-blue)"
                      : "var(--text-muted)",
                  border: `1px solid ${
                    getOptionClass(opt) ? "currentColor" : "var(--border)"
                  }`,
                }}
              >
                {opt}
              </span>
              <span className="selectable">{getOptionLabel(opt)}</span>
              {showAnswer && opt === question.correctAnswer && (
                <CheckCircle
                  size={14}
                  className="ml-auto flex-shrink-0 mt-0.5"
                  style={{ color: "var(--accent-green)" }}
                />
              )}
              {showAnswer && opt === selectedOption && opt !== question.correctAnswer && (
                <XCircle
                  size={14}
                  className="ml-auto flex-shrink-0 mt-0.5"
                  style={{ color: "var(--accent-rose)" }}
                />
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Study mode: show result + explanation */}
      {showAnswer && selectedOption && (
        <div
          className="rounded-xl p-4 text-sm"
          style={{
            background: isCorrect
              ? "rgba(34,197,94,0.06)"
              : "rgba(244,63,94,0.06)",
            border: `1px solid ${
              isCorrect ? "rgba(34,197,94,0.2)" : "rgba(244,63,94,0.2)"
            }`,
          }}
        >
          <div
            className="font-semibold mb-1.5 flex items-center gap-2"
            style={{
              color: isCorrect ? "var(--accent-green)" : "var(--accent-rose)",
            }}
          >
            {isCorrect ? (
              <><CheckCircle size={14} /> Correct!</>
            ) : (
              <><XCircle size={14} /> Incorrect — Answer is {question.correctAnswer}</>
            )}
          </div>
          {question.explanation && (
            <div
              className="selectable leading-relaxed flex gap-2"
              style={{ color: "var(--text-secondary)" }}
            >
              <Lightbulb size={14} className="mt-0.5 flex-shrink-0" style={{ color: "var(--accent-amber)" }} />
              <span>{question.explanation}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
