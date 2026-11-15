import { Shimmer } from "@/components/fx/Loaders";

const corners = [
  "rounded-tl-[120px]",
  "rounded-tr-[120px]",
  "rounded-bl-[120px]",
  "rounded-br-[120px]",
  "rounded-tl-[120px]",
  "rounded-tr-[120px]",
];

export default function QuizzesLoading() {
  return (
    <section role="status" aria-live="polite" className="container mx-auto max-w-6xl px-4 pb-12 pt-8 sm:px-6">
      <Shimmer className="mb-4 h-4 w-14 rounded" />
      <Shimmer className="mb-8 h-20 w-full max-w-xl rounded-md" />
      <div className="mb-8 flex flex-wrap gap-2.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <Shimmer key={i} className="h-10 w-24 rounded-full" />
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {corners.map((corner, i) => (
          <Shimmer key={i} className={`h-[300px] border-[3px] border-[#0F3D2E]/30 ${corner}`} />
        ))}
      </div>
      <span className="sr-only">Loading quizzes</span>
    </section>
  );
}