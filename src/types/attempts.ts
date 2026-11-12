export type AttemptStatus = 'in_progress' | 'submitted';

export interface CreateAttemptRequest {
  quizId: string;
  forceRetake?: boolean;
}

export interface SaveAnswerRequest {
  questionId: string;
  optionId: string | null;
}

export interface AttemptState {
  id: string;
  quizId: string;
  userId: string;
  status: AttemptStatus;
  score: number;
  totalPoints: number;
  startedAt: string;
  submittedAt: string | null;
  timeTakenSeconds: number | null;
  durationSeconds: number;
  secondsPerQuestion: number;
  remainingSeconds: number;
  isExpired: boolean;
  savedAnswers: Record<string, string | null>; // questionId -> optionId
  totalQuestions: number;
  answeredCount: number;
}

export interface SubmitAttemptResponse {
  attemptId: string;
  quizId: string;
  userId: string;
  status: 'submitted';
  score: number;
  totalPoints: number;
  timeTakenSeconds: number;
  submittedAt: string;
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  percentage: number;
  isDuplicate: boolean;
}

export interface OptionReview {
  id: string;
  text: string;
  position: number;
  isCorrect: boolean;
}

export interface QuestionReview {
  questionId: string;
  questionText: string;
  position: number;
  explanation: string | null;
  userOptionId: string | null;
  isCorrect: boolean;
  options: OptionReview[];
}

export interface AttemptReviewResponse {
  attemptId: string;
  quizId: string;
  userId: string;
  score: number;
  totalPoints: number;
  timeTakenSeconds: number;
  submittedAt: string;
  totalQuestions: number;
  correctCount: number;
  percentage: number;
  questions: QuestionReview[];
}
