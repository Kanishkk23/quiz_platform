"use client";

import { useEffect, useRef, useState } from "react";

const DISPLAY = "font-[family-name:var(--font-display)]";
const MONO = "font-[family-name:var(--font-mono)]";

function Counter({ to, prefix = "" }: { to: number; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        if (reduce) {
          setN(to);
          return;
        }
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - start) / 1400);
          setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.5 }
    );
    io.observe(el);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to]);

  return (
    <span ref={ref}>
      {prefix}
      {n}
    </span>
  );
}

const cards = [
  { value: <Counter to={10} prefix="+" />, label: "points per correct answer", tone: "bg-[#FFE94A]", corner: "rounded-tl-[80px]" },
  { value: <Counter to={0} />, label: "negative marking, ever", tone: "bg-[#FFFDF5]", corner: "rounded-tr-[80px]" },
  { value: <span className="qz-wiggle inline-block">∞</span>, label: "retakes while a quiz is open", tone: "bg-[#BDF2D5]", corner: "rounded-br-[80px]" },
];

export function StatsStrip() {
  return (
    <section
      className="bg-[#BDF2D5] px-4 py-24 sm:px-6"
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
      <div className="container mx-auto max-w-6xl">
        <p data-fx="text" className={`${MONO} mb-3 text-sm font-bold text-[#0F3D2E]`}>Q3.</p>
        <h2
          data-fx="title"
          data-reveal
          className={`${DISPLAY} mb-12 font-extrabold leading-[0.92] tracking-tight text-[#0F3D2E]`}
          style={{ fontSize: "clamp(2.75rem, 7vw, 6rem)" }}
        >
          the rules,{" "}
          <span data-fx="mark" className="bg-[linear-gradient(transparent_58%,#FFE94A_58%)]">in numbers.</span>
        </h2>

        <div data-stagger className="grid gap-5 md:grid-cols-3">
          {cards.map((card) => (
            <div key={card.label} data-fx="item">
              <div
                data-tilt="9"
                className={`border-[3px] border-[#0F3D2E] p-8 text-[#0F3D2E] shadow-[9px_9px_0_#0F3D2E] ${card.tone} ${card.corner}`}
              >
                <div className={`${DISPLAY} font-extrabold leading-none`} style={{ fontSize: "clamp(4.5rem, 9vw, 7.5rem)" }}>
                  {card.value}
                </div>
                <p className={`${MONO} mt-4 text-xs font-bold uppercase`}>{card.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}