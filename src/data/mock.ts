import { Quiz, Question, LeaderboardEntry, User } from "@/types";

// Empty User data - to be populated via Supabase Auth / dynamic login
export const mockUsers: User[] = [];

// Empty Quizzes - to be fetched from database
export const mockQuizzes: Quiz[] = [];

// Empty Questions - to be fetched from database by quizId
export const mockQuestions: Record<string, Question[]> = {};

// Empty Leaderboard - to be fetched from database / realtime
export const mockLeaderboard: LeaderboardEntry[] = [];
