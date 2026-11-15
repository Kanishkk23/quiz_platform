import { Shimmer } from "@/components/fx/Loaders";

const towers = ["h-[300px]", "h-[380px]", "h-[240px]", "h-[200px]", "h-[160px]"];

export default function LeaderboardLoading() {
  return (
    <section role="status" aria-live="polite" className="container mx-auto max-w-6xl px-4 pb-12 pt-8 sm:px-6">
      <Shimmer className="mb-4 h-4 w-12 rounded" />
      <Shimmer className="mb-10 h-32 w-full max-w-2xl rounded-md" />
      <ol className="flex items-end gap-2 sm:gap-4">
        {towers.map((height, i) => (
          <li key={i} className="flex min-w-0 flex-1 flex-col justify-end">
            <Shimmer className={`rounded-t-full border-[3px] border-b-0 border-dashed border-[#0F3D2E]/50 ${height}`} />
            <div className="border-t-[3px] border-[#0F3D2E] pt-2">
              <Shimmer className="mx-auto h-5 w-2/3 rounded" />
            </div>
          </li>
        ))}
      </ol>
      <span className="sr-only">Loading leaderboard</span>
    </section>
  );
}