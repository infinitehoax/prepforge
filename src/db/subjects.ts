import type { Subject, ExamType } from "@/types";

export const SUBJECTS: Subject[] = [
  {
    id: "english",
    name: "Use of English",
    icon: "📝",
    color: "#6366f1",
    availableFor: ["JAMB", "WAEC"],
  },
  {
    id: "mathematics",
    name: "Mathematics",
    icon: "📐",
    color: "#0ea5e9",
    availableFor: ["JAMB", "WAEC"],
  },
  {
    id: "physics",
    name: "Physics",
    icon: "⚛️",
    color: "#f59e0b",
    availableFor: ["JAMB", "WAEC"],
  },
  {
    id: "chemistry",
    name: "Chemistry",
    icon: "🧪",
    color: "#10b981",
    availableFor: ["JAMB", "WAEC"],
  },
  {
    id: "biology",
    name: "Biology",
    icon: "🧬",
    color: "#22c55e",
    availableFor: ["JAMB", "WAEC"],
  },
  {
    id: "economics",
    name: "Economics",
    icon: "📊",
    color: "#f97316",
    availableFor: ["JAMB", "WAEC"],
  },
  {
    id: "literature",
    name: "Literature",
    icon: "📚",
    color: "#ec4899",
    availableFor: ["JAMB", "WAEC"],
  },
  {
    id: "government",
    name: "Government",
    icon: "🏛️",
    color: "#8b5cf6",
    availableFor: ["JAMB", "WAEC"],
  },
  {
    id: "geography",
    name: "Geography",
    icon: "🌍",
    color: "#06b6d4",
    availableFor: ["JAMB", "WAEC"],
  },
  {
    id: "commerce",
    name: "Commerce",
    icon: "💼",
    color: "#84cc16",
    availableFor: ["WAEC"],
  },
  {
    id: "accounting",
    name: "Accounting",
    icon: "🧮",
    color: "#f43f5e",
    availableFor: ["JAMB", "WAEC"],
  },
  {
    id: "agricultural_science",
    name: "Agricultural Science",
    icon: "🌱",
    color: "#16a34a",
    availableFor: ["JAMB", "WAEC"],
  },
  {
    id: "further_mathematics",
    name: "Further Mathematics",
    icon: "∑",
    color: "#7c3aed",
    availableFor: ["WAEC"],
  },
  {
    id: "civic_education",
    name: "Civic Education",
    icon: "🏡",
    color: "#0891b2",
    availableFor: ["JAMB"],
  },
];

export function getSubjectsForExam(examType: ExamType): Subject[] {
  return SUBJECTS.filter((s) => s.availableFor.includes(examType));
}

export function getSubjectById(id: string): Subject | undefined {
  return SUBJECTS.find((s) => s.id === id);
}

export const EXAM_CONFIG = {
  JAMB: {
    requiredSubjects: 4,
    mandatorySubject: "english" as const,
    durationMinutes: 100,
    totalQuestions: 40,
    description: "UTME — 4 subjects, 40 questions each",
  },
  WAEC: {
    requiredSubjects: null,
    mandatorySubject: null,
    durationMinutes: 150,
    totalQuestions: 50,
    description: "SSCE — select any subject to practice",
  },
};
