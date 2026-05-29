import { create } from "zustand";
import type {
  ExamType,
  SubjectId,
  Question,
  AnswerOption,
  UserAnswer,
  PracticeMode,
} from "@/types";

interface ExamConfig {
  examType: ExamType;
  subjects: SubjectId[];
  mode: PracticeMode;
  year: number;
  durationSeconds: number;
}

interface ExamState {
  // Config phase
  config: ExamConfig | null;

  // Active exam
  questions: Question[];
  currentIndex: number;
  answers: Record<number, AnswerOption | null>;
  questionStartTime: number;
  questionTimes: Record<number, number>;
  timeRemainingSeconds: number;
  examStartTime: number | null;
  isSubmitted: boolean;
  resultId: number | null;

  // Flagged for review
  flagged: Set<number>;

  // Actions
  setConfig: (config: ExamConfig) => void;
  startExam: (questions: Question[]) => void;
  selectAnswer: (questionId: number, option: AnswerOption) => void;
  goToQuestion: (index: number) => void;
  goNext: () => void;
  goPrev: () => void;
  toggleFlag: (questionId: number) => void;
  tickTimer: () => void;
  submitExam: () => UserAnswer[];
  setResultId: (id: number) => void;
  resetExam: () => void;
}

const JAMB_DURATION = 100 * 60; // 100 minutes
const WAEC_DURATION = 150 * 60; // 150 minutes

export const useExamStore = create<ExamState>((set, get) => ({
  config: null,
  questions: [],
  currentIndex: 0,
  answers: {},
  questionStartTime: Date.now(),
  questionTimes: {},
  timeRemainingSeconds: 0,
  examStartTime: null,
  isSubmitted: false,
  resultId: null,
  flagged: new Set(),

  setConfig: (config) => {
    const duration =
      config.durationSeconds ||
      (config.examType === "JAMB" ? JAMB_DURATION : WAEC_DURATION);
    set({ config: { ...config, durationSeconds: duration } });
  },

  startExam: (questions) => {
    const { config } = get();
    set({
      questions,
      currentIndex: 0,
      answers: {},
      questionStartTime: Date.now(),
      questionTimes: {},
      timeRemainingSeconds: config?.durationSeconds || JAMB_DURATION,
      examStartTime: Date.now(),
      isSubmitted: false,
      resultId: null,
      flagged: new Set(),
    });
  },

  selectAnswer: (questionId, option) => {
    const { answers, questionStartTime, questionTimes } = get();
    const elapsed = Math.floor((Date.now() - questionStartTime) / 1000);
    set({
      answers: { ...answers, [questionId]: option },
      questionTimes: {
        ...questionTimes,
        [questionId]: (questionTimes[questionId] || 0) + elapsed,
      },
      questionStartTime: Date.now(),
    });
  },

  goToQuestion: (index) => {
    const { questions, questionStartTime, questionTimes, currentIndex } = get();
    if (index < 0 || index >= questions.length) return;
    const currentQId = questions[currentIndex]?.id;
    const elapsed = Math.floor((Date.now() - questionStartTime) / 1000);
    set({
      currentIndex: index,
      questionStartTime: Date.now(),
      questionTimes: currentQId
        ? {
            ...questionTimes,
            [currentQId]: (questionTimes[currentQId] || 0) + elapsed,
          }
        : questionTimes,
    });
  },

  goNext: () => {
    const { currentIndex, questions } = get();
    if (currentIndex < questions.length - 1) {
      get().goToQuestion(currentIndex + 1);
    }
  },

  goPrev: () => {
    const { currentIndex } = get();
    if (currentIndex > 0) {
      get().goToQuestion(currentIndex - 1);
    }
  },

  toggleFlag: (questionId) => {
    const { flagged } = get();
    const newFlagged = new Set(flagged);
    if (newFlagged.has(questionId)) {
      newFlagged.delete(questionId);
    } else {
      newFlagged.add(questionId);
    }
    set({ flagged: newFlagged });
  },

  tickTimer: () => {
    const { timeRemainingSeconds } = get();
    if (timeRemainingSeconds > 0) {
      set({ timeRemainingSeconds: timeRemainingSeconds - 1 });
    }
  },

  submitExam: () => {
    const { questions, answers, questionTimes, questionStartTime, currentIndex } = get();
    const currentQId = questions[currentIndex]?.id;
    const elapsed = Math.floor((Date.now() - questionStartTime) / 1000);
    const finalTimes = currentQId
      ? { ...questionTimes, [currentQId]: (questionTimes[currentQId] || 0) + elapsed }
      : questionTimes;

    const userAnswers: UserAnswer[] = questions.map((q) => ({
      questionId: q.id,
      selectedOption: answers[q.id] || null,
      isCorrect:
        answers[q.id] != null ? answers[q.id] === q.correctAnswer : null,
      timeSpentSeconds: finalTimes[q.id] || 0,
    }));

    set({ isSubmitted: true });
    return userAnswers;
  },

  setResultId: (id) => set({ resultId: id }),

  resetExam: () =>
    set({
      config: null,
      questions: [],
      currentIndex: 0,
      answers: {},
      questionStartTime: Date.now(),
      questionTimes: {},
      timeRemainingSeconds: 0,
      examStartTime: null,
      isSubmitted: false,
      resultId: null,
      flagged: new Set(),
    }),
}));
