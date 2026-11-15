import { ChipsLoader, EqualizerLoader, OrbitLoader, QLoader, Shimmer } from "@/components/fx/Loaders";

const cards = [
  { name: "Q-draw", node: <QLoader size={120} /> },
  { name: "Answer chips", node: <ChipsLoader /> },
  { name: "Equalizer", node: <EqualizerLoader /> },
  { name: "Orbit", node: <OrbitLoader /> },
];

export default function LoaderLab() {
  return (
    <section className="container mx-auto max-w-6xl px-4 pb-12 pt-8 sm:px-6">
      <p className="mb-4 font-mono text-sm">LAB.</p>
      <h1
        className="mb-10 font-[family-name:var(--font-display)] font-extrabold leading-[0.92] tracking-tight"
        style={{ fontSize: "clamp(3rem, 8vw, 6rem)" }}
      >
        loader lab.
      </h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <div
            key={card.name}
            className="flex min-h-[220px] flex-col items-center justify-center gap-5 rounded-[18px] border-[3px] border-[#0F3D2E] bg-[#FFFDF5] p-6 shadow-[6px_6px_0_#0F3D2E]"
          >
            {card.node}
            <span className="font-mono text-xs font-bold uppercase">{card.name}</span>
          </div>
        ))}
        <div className="flex min-h-[220px] flex-col justify-center gap-3 rounded-[18px] border-[3px] border-[#0F3D2E] bg-[#FFFDF5] p-6 shadow-[6px_6px_0_#0F3D2E] sm:col-span-2">
          <Shimmer className="h-6 w-1/2 rounded" />
          <Shimmer className="h-16 w-full rounded-md" />
          <Shimmer className="h-6 w-2/3 rounded" />
          <span className="font-mono text-xs font-bold uppercase">Shimmer skeleton</span>
        </div>
      </div>
    </section>
  );
}