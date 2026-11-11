// Quiz Platform Type Definitions

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  questionCount: number;
  timeLimit: number; // in seconds for entire quiz
  timerMode?: "quiz" | "question"; // Support per-quiz or per-question timer
  questionTimeLimit?: number; // in seconds per question when in question mode
  createdAt: string;
  availability?: "live" | "upcoming" | "finished";
  startsAt?: string;
  endsAt?: string;
}

export interface Question {
  id: string;
  quizId: string;
  text: string;
  options: Option[];
  correctOptionId: string;
  explanation?: string;
}

export interface Option {
  id: string;
  text: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  answers: Record<string, string>; // questionId -> selectedOptionId
  score: number;
  totalQuestions: number;
  timeTaken: number; // in seconds
  completedAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  avatarUrl?: string;
  quizId: string;
  quizTitle?: string;
  score: number;
  totalQuestions: number;
  timeTaken: number; // in seconds
  completedAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
