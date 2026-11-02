import { Suspense } from "react";
import { QuizAttemptView } from "@/components/quiz/QuizAttemptView";
import { mockQuizzes } from "@/data/mock";

export function generateStaticParams() {
  return mockQuizzes.map((quiz) => ({
    id: quiz.id,
  }));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function QuizPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <QuizAttemptView quizId={id} />
    </Suspense>
  );
}
