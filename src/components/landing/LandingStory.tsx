"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const MONO = "font-[family-name:var(--font-mono)]";
const DISPLAY = "font-[family-name:var(--font-display)]";

const steps = [
  { n: "01", title: "pick a quiz.", body: "Browse live quizzes by category and difficulty. Jump in any time while the window is open." },
  { n: "02", title: "beat the clock.", body: "One question at a time, each with its own timer. Change your answers until you hit submit." },
  { n: "03", title: "climb the ranks.", body: "Scores land on the per-quiz leaderboard in real time. Same score? The faster time wins." },
];

const categories = [
  { name: "tech", tone: "bg-[#FFE94A] text-[#0F3D2E]" },
  { name: "science", tone: "bg-[#FFFDF5] text-[#0F3D2E]" },
  { name: "history", tone: "bg-[#BDF2D5] text-[#0F3D2E]" },
  { name: "sports", tone: "bg-[#1F9D6B] text-[#FFFDF5]" },
];

const chips = [
  { k: "A", tone: "bg-[#FFE94A] text-[#0F3D2E]" },
  { k: "B", tone: "bg-[#FFFDF5] text-[#0F3D2E]", pick: true },
  { k: "C", tone: "bg-[#1F9D6B] text-[#FFFDF5]" },
  { k: "D", tone: "bg-[#BDF2D5] text-[#0F3D2E]" },
];

const towers = [
  { h: "100%", tone: "bg-[#FFE94A] text-[#0F3D2E]" },
  { h: "78%", tone: "bg-[#FFFDF5] text-[#0F3D2E]" },
  { h: "62%", tone: "bg-[#1F9D6B] text-[#FFFDF5]" },
  { h: "48%", tone: "bg-[#BDF2D5] text-[#0F3D2E]" },
];

export function LandingStory() {
  const root = useRef<HTMLElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const q = gsap.utils.selector(el);
    const stepEls = q("[data-step]") as HTMLElement[];
    const visEls = q("[data-vis]") as HTMLElement[];
    const dots = q("[data-dot]") as HTMLElement[];
    const cards = q("[data-card]") as HTMLElement[];
    const chipsEls = q("[data-chip]") as HTMLElement[];
    const towersEls = q("[data-tower]") as HTMLElement[];
    const crownEl = el.querySelector("[data-crown]") as HTMLElement;
    const ring = el.querySelector("[data-ring]") as SVGElement | null;
    const time = el.querySelector("[data-time]") as SVGElement | null;
    const pick = el.querySelector("[data-pick]") as HTMLElement | null;
    const proxy = { v: 20 };

    const setDot = (index: number) => {
      dots.forEach((dot, k) => {
        dot.dataset.on = String(k === index);
      });
    };

    const mm = gsap.matchMedia();

    // Continuous video-like autoplay loop without scroll hijacking or pinning
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // Set initial states
      gsap.set(visEls.slice(1), { autoAlpha: 0 });
      gsap.set(stepEls.slice(1), { autoAlpha: 0, y: 30 });
      gsap.set(visEls[0], { autoAlpha: 1, scale: 1 });
      gsap.set(stepEls[0], { autoAlpha: 1, y: 0 });

      const tl = gsap.timeline({
        repeat: -1,
        defaults: { ease: "power2.out" },
      });
      tlRef.current = tl;

      // ==========================================
      // Scene 1: pick a quiz
      // ==========================================
      tl.addLabel("scene1")
        .call(() => setDot(0))
        .set(stepEls[0], { autoAlpha: 1, y: 0 })
        .set(visEls[0], { autoAlpha: 1, scale: 1 })
        .fromTo(
          cards,
          { y: 55, autoAlpha: 0, rotate: (i: number) => (i % 2 ? 6 : -6) },
          { y: 0, autoAlpha: 1, rotate: 0, stagger: 0.12, duration: 0.6, ease: "back.out(1.5)" }
        )
        // Hold Scene 1 for comfortable reading
        .to({}, { duration: 2.8 })
        // Out-transition Scene 1
        .to(stepEls[0], { autoAlpha: 0, y: -30, duration: 0.45, ease: "power2.in" })
        .to(visEls[0], { autoAlpha: 0, scale: 0.95, duration: 0.45, ease: "power2.in" }, "<")

        // ==========================================
        // Scene 2: beat the clock
        // ==========================================
        .addLabel("scene2")
        .call(() => {
          setDot(1);
          proxy.v = 20;
          if (time) time.textContent = "0:20";
          ring?.setAttribute("stroke-dashoffset", "0");
        })
        .set(pick, { scale: 1, rotate: 0 })
        .fromTo(stepEls[1], { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: "power2.out" })
        .fromTo(visEls[1], { autoAlpha: 0, scale: 0.95 }, { autoAlpha: 1, scale: 1, duration: 0.45, ease: "power2.out" }, "<")
        .fromTo(chipsEls, { y: 35, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.08, duration: 0.35 }, "-=0.2")
        .to(proxy, {
          v: 4,
          duration: 2.0,
          ease: "none",
          onUpdate: () => {
            ring?.setAttribute("stroke-dashoffset", String(1 - proxy.v / 20));
            if (time) time.textContent = `0:${String(Math.ceil(proxy.v)).padStart(2, "0")}`;
          },
        })
        .to(pick, { scale: 1.15, rotate: -6, duration: 0.4, ease: "back.out(2)" })
        // Hold Scene 2
        .to({}, { duration: 1.2 })
        // Out-transition Scene 2
        .to(stepEls[1], { autoAlpha: 0, y: -30, duration: 0.45, ease: "power2.in" })
        .to(visEls[1], { autoAlpha: 0, scale: 0.95, duration: 0.45, ease: "power2.in" }, "<")

        // ==========================================
        // Scene 3: climb the ranks
        // ==========================================
        .addLabel("scene3")
        .call(() => setDot(2))
        .fromTo(stepEls[2], { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: "power2.out" })
        .fromTo(visEls[2], { autoAlpha: 0, scale: 0.95 }, { autoAlpha: 1, scale: 1, duration: 0.45, ease: "power2.out" }, "<")
        .fromTo(towersEls, { scaleY: 0 }, { scaleY: 1, transformOrigin: "bottom", stagger: 0.12, duration: 0.7, ease: "back.out(1.4)" }, "-=0.2")
        .fromTo(crownEl, { autoAlpha: 0, y: -25, scale: 0.3 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(3)" })
        // Hold Scene 3
        .to({}, { duration: 2.5 })
        // Out-transition Scene 3
        .to(stepEls[2], { autoAlpha: 0, y: -30, duration: 0.45, ease: "power2.in" })
        .to(visEls[2], { autoAlpha: 0, scale: 0.95, duration: 0.45, ease: "power2.in" }, "<");
    });

    // Reduced motion: show static stacked layout
    mm.add("(prefers-reduced-motion: reduce)", () => {
      el.style.height = "auto";
      el.style.overflow = "visible";
      const stack = el.querySelector<HTMLElement>("[data-stack]");
      if (stack) stack.style.height = "auto";
      stepEls.forEach((step) => {
        step.classList.remove("invisible");
        step.style.position = "static";
        step.style.marginBottom = "2rem";
      });
      visEls.slice(1).forEach((vis) => {
        vis.style.display = "none";
      });
    });

    return () => {
      mm.revert();
    };
  }, []);

  const jumpTo = (index: number) => {
    if (tlRef.current) {
      tlRef.current.seek(`scene${index + 1}`);
      tlRef.current.play();
    }
  };

  return (
    <section
      ref={root}
      aria-label="How it works"
      className="relative min-h-[620px] lg:h-[700px] flex items-center overflow-hidden bg-[#0F3D2E] text-[#FFFDF5]"
    >
      <p className={`${MONO} absolute left-1/2 top-6 -translate-x-1/2 text-xs font-bold uppercase tracking-widest text-[#BDF2D5]`}>
        Q2. How does it work?
      </p>

      <div className="container mx-auto grid h-full max-w-6xl items-center gap-6 px-4 pb-14 pt-20 sm:px-6 md:grid-cols-2 md:gap-12">
        {/* Text */}
        <div data-stack className="relative h-[230px] sm:h-[300px]">
          {steps.map((step, i) => (
            <div
              key={step.n}
              data-step
              className={`absolute inset-0 flex flex-col justify-center ${i > 0 ? "invisible" : ""}`}
            >
              <span className={`${MONO} text-sm font-bold text-[#BDF2D5]`}>{step.n} / 03</span>
              <h2
                className={`${DISPLAY} mt-2 font-extrabold leading-[0.92] tracking-tight`}
                style={{ fontSize: "clamp(2.75rem, 7vw, 6rem)" }}
              >
                <span className="rounded-[10px] bg-[#FFE94A] px-3 pb-1 text-[#0F3D2E]">{step.title}</span>
              </h2>
              <p className="mt-5 max-w-md text-base font-medium leading-relaxed text-[#FFFDF5]/85 sm:text-lg">
                {step.body}
              </p>
            </div>
          ))}
        </div>

        {/* Visuals */}
        <div className="relative h-[300px] sm:h-[440px]">
          {/* Scene 1: category cards */}
          <div data-vis className="absolute inset-0 grid grid-cols-2 content-center gap-4">
            {categories.map((c, i) => (
              <div
                key={c.name}
                data-card
                className={`flex h-32 flex-col justify-between rounded-[14px] border-[3px] border-[#0F3D2E] p-4 shadow-[5px_5px_0_#FFE94A] sm:h-40 ${c.tone}`}
              >
                <span className={`${MONO} text-[11px] font-bold uppercase`}>Q.{i + 1}</span>
                <span className={`${DISPLAY} text-2xl font-extrabold sm:text-3xl`}>{c.name}</span>
              </div>
            ))}
          </div>

          {/* Scene 2: timer + answers */}
          <div data-vis className="invisible absolute inset-0 flex flex-col items-center justify-center gap-6">
            <svg viewBox="0 0 100 100" className="h-40 w-40 sm:h-56 sm:w-56" role="img" aria-label="Countdown timer">
              <circle cx="50" cy="50" r="46" fill="#0F3D2E" stroke="#FFFDF5" strokeWidth="3" />
              <circle cx="50" cy="50" r="38" fill="none" stroke="#1F9D6B" strokeWidth="8" />
              <circle
                data-ring cx="50" cy="50" r="38" fill="none" stroke="#FFE94A" strokeWidth="8"
                pathLength={1} strokeDasharray="1" strokeDashoffset="0" transform="rotate(-90 50 50)"
              />
              <text
                data-time x="50" y="58" textAnchor="middle" fill="#FFFDF5" fontSize="22"
                fontFamily="var(--font-mono), ui-monospace, monospace"
              >
                0:20
              </text>
            </svg>
            <div className="flex gap-3">
              {chips.map((chip) => (
                <span
                  key={chip.k}
                  data-chip
                  {...(chip.pick ? { "data-pick": "" } : {})}
                  className={`flex h-14 w-14 items-center justify-center rounded-[12px] border-[3px] border-[#0F3D2E] ${DISPLAY} text-2xl font-extrabold shadow-[4px_4px_0_#FFE94A] sm:h-16 sm:w-16 ${chip.tone}`}
                >
                  {chip.k}
                </span>
              ))}
            </div>
          </div>

          {/* Scene 3: towers */}
          <div data-vis className="invisible absolute inset-0 flex items-end gap-3 pb-4">
            {towers.map((t, i) => (
              <div
                key={i}
                data-tower
                className={`relative flex flex-1 items-start justify-center rounded-t-full border-[3px] border-b-0 border-[#0F3D2E] pt-4 ${DISPLAY} text-4xl font-extrabold sm:text-6xl ${t.tone}`}
                style={{ height: t.h }}
              >
                {i === 0 && (
                  <svg
                    data-crown viewBox="0 0 48 32" aria-hidden="true"
                    className="absolute -top-10 left-1/2 h-9 w-14 -translate-x-1/2"
                  >
                    <path
                      d="M4 28 L8 8 L18 18 L24 4 L30 18 L40 8 L44 28 Z"
                      fill="#FFE94A" stroke="#FFFDF5" strokeWidth="3" strokeLinejoin="round"
                    />
                  </svg>
                )}
                {i + 1}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Progress dots / interactive controls */}
      <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-3" aria-label="Animation progress">
        {[0, 1, 2].map((i) => (
          <button
            key={i}
            type="button"
            data-dot
            data-on={i === 0 ? "true" : "false"}
            onClick={() => jumpTo(i)}
            aria-label={`Jump to scene ${i + 1}`}
            className="h-2.5 w-2.5 rounded-full border-2 border-[#FFFDF5]/60 transition-all duration-300 data-[on=true]:w-10 data-[on=true]:border-[#FFE94A] data-[on=true]:bg-[#FFE94A] cursor-pointer focus:outline-none"
          />
        ))}
      </div>
    </section>
  );
}
