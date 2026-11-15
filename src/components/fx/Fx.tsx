"use client";

import { useEffect, useRef } from "react";
import { fireConfetti } from "@/components/fx/confetti";

/**
 * Site-wide effects: scroll progress bar, magnetic hover,
 * 3D tilt and click confetti. Nothing here re-renders React; it only touches the DOM.
 *
 * Opt in from any element with:
 *   data-magnetic      pulls toward the cursor
 *   data-tilt="6"      tilts in 3D (number = max degrees)
 *   data-confetti      confetti burst on click
 */
export function Fx() {
  const barRef = useRef<HTMLDivElement>(null);

  // Scroll progress bar
  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    let raf = 0;

    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      bar.style.transform = `scaleX(${progress})`;
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Magnetic hover, tilt and confetti
  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!finePointer || reduce) return;

    let magnet: HTMLElement | null = null;
    let tilting: HTMLElement | null = null;

    const clearMagnet = () => {
      if (magnet) magnet.style.translate = "";
      magnet = null;
    };
    const clearTilt = () => {
      if (tilting) {
        tilting.style.removeProperty("--rx");
        tilting.style.removeProperty("--ry");
      }
      tilting = null;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;

      const el = e.target instanceof Element ? e.target : null;

      // Magnetic hover
      const m = el?.closest<HTMLElement>("[data-magnetic]") ?? null;
      if (magnet && magnet !== m) clearMagnet();
      if (m) {
        const r = m.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        m.style.translate = `${(dx * 0.22).toFixed(1)}px ${(dy * 0.32).toFixed(1)}px`;
        magnet = m;
      }

      // 3D tilt
      const t = el?.closest<HTMLElement>("[data-tilt]") ?? null;
      if (tilting && tilting !== t) clearTilt();
      if (t) {
        const r = t.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        const max = Number(t.dataset.tilt) || 6;
        t.style.setProperty("--rx", `${(-py * max).toFixed(2)}deg`);
        t.style.setProperty("--ry", `${(px * max).toFixed(2)}deg`);
        tilting = t;
      }
    };

    const onClick = (e: MouseEvent) => {
      const c = e.target instanceof Element ? e.target.closest("[data-confetti]") : null;
      if (c) fireConfetti(e.clientX, e.clientY);
    };

    const onLeave = () => {
      clearMagnet();
      clearTilt();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("click", onClick);
    document.documentElement.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("click", onClick);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      clearMagnet();
      clearTilt();
    };
  }, []);

  return (
    <div ref={barRef} aria-hidden="true" className="qz-progress" />
  );
}
