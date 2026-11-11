export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[60vh] flex-col items-center justify-center gap-6 bg-[#BDF2D5] px-4"
    >
      <div className="flex gap-3" aria-hidden="true">
        {[
          { letter: "A", tone: "bg-[#FFE94A] text-[#0F3D2E]" },
          { letter: "B", tone: "bg-[#0F3D2E] text-[#FFFDF5]" },
          { letter: "C", tone: "bg-[#FFFDF5] text-[#0F3D2E]" },
          { letter: "D", tone: "bg-[#1F9D6B] text-[#FFFDF5]" },
        ].map((chip, i) => (
          <span
            key={chip.letter}
            className={`qz-hop flex h-14 w-14 items-center justify-center rounded-[12px] border-[3px] border-[#0F3D2E] font-[family-name:var(--font-display)] text-2xl font-extrabold shadow-[4px_4px_0_#0F3D2E] ${chip.tone}`}
            style={{ animationDelay: `${i * 0.15}s` }}
          >
            {chip.letter}
          </span>
        ))}
      </div>
      <p className="font-[family-name:var(--font-hand)] text-3xl text-[#0F3D2E]">loading…</p>
      <span className="sr-only">Loading</span>
    </div>
  );
}