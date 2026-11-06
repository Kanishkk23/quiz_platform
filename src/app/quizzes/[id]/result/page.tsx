import { Suspense } from "react";
import { QuizResultView } from "@/components/quiz/QuizResultView";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ResultPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div
      className="min-h-[calc(100vh-4rem)] py-10 px-4 sm:px-6 bg-[#BDF2D5]"
      style={{
        backgroundImage: `
          linear-gradient(rgba(15, 61, 46, 0.18) 1.5px, transparent 1.5px),
          linear-gradient(90deg, rgba(15, 61, 46, 0.18) 1.5px, transparent 1.5px),
          linear-gradient(rgba(15, 61, 46, 0.08) 1px, transparent 1px),
          linear-gradient(90deg, rgba(15, 61, 46, 0.08) 1px, transparent 1px)
        `,
        backgroundSize: "160px 160px, 160px 160px, 32px 32px, 32px 32px",
        backgroundPosition: "-1px -1px",
      }}
    >
      <Suspense
        fallback={
          <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0F3D2E] border-t-transparent" />
          </div>
        }
      >
        <QuizResultView quizId={id} />
      </Suspense>
    </div>
  );
}
