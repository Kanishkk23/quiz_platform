"use client";

import { useEffect, useRef } from "react";

export function ScrollMarquee({ items }: { items: string[] }) {
  const track = useRef<HTMLDivElement>(null);
  // Repeated so each half is wider than any screen
  const loop = [...items, ...items, ...items];

  useEffect(() => {
    const el = track.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let x = 0;
    let vel = 0;
    let last = window.scrollY;
    let raf = 0;

    const frame = () => {
      const y = window.scrollY;
      vel += (y - last - vel) * 0.12;
      last = y;
      x -= 0.8 + Math.min(Math.abs(vel), 60) * 0.25;
      const half = el.scrollWidth / 2;
      if (x <= -half) x += half;
      const skew = Math.max(-14, Math.min(14, -vel * 0.35));
      el.style.transform = `translate3d(${x}px, 0, 0) skewX(${skew}deg)`;
      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="overflow-hidden border-y-[3px] border-[#0F3D2E] bg-[#FFE94A] py-4 text-[#0F3D2E]"
    >
      <div ref={track} className="flex w-max will-change-transform">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0">
            {loop.map((text, i) => (
              <span
                key={`${copy}-${i}`}
                className="flex items-center gap-8 px-4 font-[family-name:var(--font-display)] text-4xl font-extrabold uppercase sm:text-5xl"
              >
                <span>{text}</span>
                <span>✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}