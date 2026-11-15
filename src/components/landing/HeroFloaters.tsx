"use client";

import { useEffect, useRef } from "react";

const MONO = "font-[family-name:var(--font-mono)]";
const DISPLAY = "font-[family-name:var(--font-display)]";

const stickers = [
  { k: "A", pos: "left-[3%] top-[60%]", tone: "bg-[#FFE94A] text-[#0F3D2E]", size: "h-16 w-16 text-3xl", rot: "-rotate-12", depth: 34 },
  { k: "B", pos: "right-[4%] top-[10%]", tone: "bg-[#FFFDF5] text-[#0F3D2E]", size: "h-20 w-20 text-4xl", rot: "rotate-6", depth: 46 },
  { k: "C", pos: "left-[42%] top-[88%]", tone: "bg-[#1F9D6B] text-[#FFFDF5]", size: "h-14 w-14 text-2xl", rot: "rotate-12", depth: 22 },
  { k: "D", pos: "right-[7%] top-[68%]", tone: "bg-[#0F3D2E] text-[#FFE94A]", size: "h-16 w-16 text-3xl", rot: "-rotate-6", depth: 38 },
];

const bob = (delay: string) => ({ animationDelay: delay });

/**
 * Decorative layer behind the hero. Items drift with the mouse at different depths,
 * and a soft spotlight follows the pointer. Desktop mouse only; hidden on touch screens.
 */
export default function HeroFloaters() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    let raf = 0;

    const loop = () => {
      x += (tx - x) * 0.08;
      y += (ty - y) * 0.08;
      el.style.setProperty("--mx", x.toFixed(3));
      el.style.setProperty("--my", y.toFixed(3));
      raf = Math.abs(tx - x) > 0.001 || Math.abs(ty - y) > 0.001 ? requestAnimationFrame(loop) : 0;
    };

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--sx", `${e.clientX - rect.left}px`);
      el.style.setProperty("--sy", `${e.clientY - rect.top}px`);
      tx = (e.clientX / window.innerWidth - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
      if (!raf) raf = requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const drift = (depth: number) => ({
    translate: `calc(var(--mx, 0) * ${depth}px) calc(var(--my, 0) * ${depth}px)`,
  });

  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 z-[-1] hidden overflow-hidden md:block">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle 320px at var(--sx, 70%) var(--sy, 30%), rgba(255, 233, 74, 0.5), transparent 70%)",
        }}
      />

      {stickers.map((s, i) => (
        <span key={s.k} className={`absolute ${s.pos}`} style={drift(s.depth)}>
          <span
            className={`qz-bob flex items-center justify-center rounded-[14px] border-[3px] border-[#0F3D2E] ${DISPLAY} font-extrabold shadow-[5px_5px_0_#0F3D2E] ${s.tone} ${s.size} ${s.rot}`}
            style={bob(`${i * 0.7}s`)}
          >
            {s.k}
          </span>
        </span>
      ))}

      <span className="absolute left-[9%] top-[16%]" style={drift(28)}>
        <svg viewBox="0 0 100 100" className="qz-bob h-20 w-20" style={bob("0.4s")}>
          <circle cx="50" cy="50" r="46" fill="#0F3D2E" />
          <circle cx="50" cy="50" r="36" fill="none" stroke="#1F9D6B" strokeWidth="9" />
          <circle
            cx="50" cy="50" r="36" fill="none" stroke="#FFE94A" strokeWidth="9"
            pathLength={1} strokeDasharray="0.7 1" transform="rotate(-90 50 50)"
          />
        </svg>
      </span>

      <span className="absolute right-[32%] top-[5%]" style={drift(40)}>
        <span
          className={`qz-bob flex h-16 w-16 rotate-12 items-center justify-center rounded-full border-[3px] border-[#0F3D2E] bg-[#FFE94A] ${MONO} text-lg font-bold text-[#0F3D2E] shadow-[4px_4px_0_#0F3D2E]`}
          style={bob("1.1s")}
        >
          +10
        </span>
      </span>

      <span className="absolute bottom-[6%] right-[20%] flex items-end gap-2" style={drift(30)}>
        {[56, 84, 40].map((h, i) => (
          <span
            key={i}
            className={`qz-bob w-9 rounded-t-full border-[3px] border-b-0 border-[#0F3D2E] ${["bg-[#FFFDF5]", "bg-[#FFE94A]", "bg-[#BDF2D5]"][i]}`}
            style={{ height: h, ...bob(`${i * 0.5}s`) }}
          />
        ))}
      </span>
    </div>
  );
}
