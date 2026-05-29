export type ExamType = "JAMB" | "WAEC";

export type SubjectId =
  | "english"
  | "mathematics"
  | "physics"
  | "chemistry"
  | "biology"
  | "economics"
  | "literature"
  | "government"
  | "geography"
  | "commerce"
  | "accounting"
  | "agricultural_science"
  | "further_mathematics"
  | "civic_education";

export interface Subject {
  id: SubjectId;
  name: string;
  icon: string;
  color: string;
  availableFor: ExamType[];
}

export interface Question {
  id: number;
  examType: ExamType;
  subjectId: SubjectId;
  year: number;
  questionNumber: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: "A" | "B" | "C" | "D";
  explanation: string;
  topic?: string;
}

export type AnswerOption = "A" | "B" | "C" | "D";

export interface UserAnswer {
  questionId: number;
  selectedOption: AnswerOption | null;
  isCorrect: boolean | null;
  timeSpentSeconds: number;
}

export type PracticeMode = "study" | "mock";

export interface ExamSession {
  id?: number;
  examType: ExamType;
  subjects: SubjectId[];
  mode: PracticeMode;
  year: number;
  totalQuestions: number;
  score: number;
  timeTakenSeconds: number;
  completedAt: string;
  answers: UserAnswer[];
}

export interface ExamResult {
  id: number;
  examType: ExamType;
  subjects: string;
  mode: PracticeMode;
  year: number;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeTakenSeconds: number;
  completedAt: string;
}

export interface SubjectPerformance {
  subjectId: SubjectId;
  subjectName: string;
  attempted: number;
  correct: number;
  percentage: number;
}
