import IntroGate from "@/components/intro/IntroGate";
import LandingPage from "@/components/landing/LandingPage";
import {
  Clock,
  Sparkles,
  BarChart3,
  Layers,
  Hourglass,
} from "lucide-react";

export default function Home() {
  return (
    <IntroGate variant="cube">
      <LandingPage />

      {/* Modern Features Grid Section — Styled with Option 4 Study Lab */}
      <section className="relative py-20 md:py-28 border-t-[3px] border-[#0F3D2E] bg-[#BDF2D5] overflow-hidden">
        {/* CSS Graph-paper texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
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
          aria-hidden="true"
        />

        <div className="container relative z-1 mx-auto px-4 sm:px-6 max-w-7xl">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="inline-flex items-center gap-2 bg-[#FFFDF5] text-[#0F3D2E] border-2 border-dashed border-[#0F3D2E] px-4 py-1.5 rounded-full text-xs font-bold -rotate-1 shadow-[2px_2px_0_#0F3D2E]">
              <Sparkles className="h-3.5 w-3.5 text-[#0F3D2E]" />
              Study Lab Curriculum &amp; Mechanics
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-[family-name:var(--font-display)] font-extrabold tracking-tight text-[#0F3D2E] leading-tight">
              Engineered for{" "}
              <span className="bg-[#FFE94A] border-2 border-[#0F3D2E] px-2.5 py-0.5 rounded-lg shadow-[4px_4px_0_#0F3D2E] inline-block -rotate-1">
                Precision &amp; Mastery
              </span>
            </h2>
            <p className="text-[#0F3D2E]/85 text-base sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
              Tactile quiz tools, adaptive countdown pressure, and granular answer breakdowns that make revision effortless.
            </p>
          </div>

          {/* Features Grid: 3 balanced cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature Card 1: Adaptive Quiz Timers */}
            <div className="bg-[#FFFDF5] border-[3px] border-[#0F3D2E] rounded-[18px] shadow-[9px_9px_0_#0F3D2E] flex flex-col justify-between hover:-translate-y-1 hover:shadow-[11px_11px_0_#0F3D2E] transition-all p-7 sm:p-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 text-[#0F3D2E] bg-[#FFE94A] border-2 border-[#0F3D2E] px-3 py-1 rounded-full text-xs font-bold shadow-[2px_2px_0_#0F3D2E]">
                  <Clock className="h-3.5 w-3.5 text-[#0F3D2E]" />
                  Flexible Timing
                </div>
                <h3 className="text-2xl font-[family-name:var(--font-display)] font-bold text-[#0F3D2E] tracking-tight">
                  Adaptive Quiz Timers
                </h3>
                <p className="text-sm text-[#0F3D2E]/80 leading-relaxed font-medium">
                  Switch seamlessly between an overall quiz countdown or a high-intensity 30s per-question timer with automatic question advance.
                </p>
              </div>

              <div className="space-y-3 pt-6 mt-4 border-t-2 border-dashed border-[#0F3D2E]/20">
                <div className="flex items-center justify-between p-3 rounded-[12px] border-2 border-[#0F3D2E] bg-[#E3F9EE] text-xs font-bold text-[#0F3D2E]">
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#0F3D2E]" />
                    Full Quiz Mode
                  </span>
                  <span className="bg-[#FFFDF5] border border-[#0F3D2E] px-2 py-0.5 rounded-md text-[11px]">Standard limit</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-[12px] border-2 border-[#0F3D2E] bg-[#FFE94A] text-xs font-bold text-[#0F3D2E] shadow-[3px_3px_0_#0F3D2E]">
                  <span className="flex items-center gap-2">
                    <Hourglass className="h-4 w-4 text-[#0F3D2E]" />
                    Per-Question Blitz
                  </span>
                  <span className="bg-[#0F3D2E] text-[#FFFDF5] px-2 py-0.5 rounded-md text-[11px]">30s / Q</span>
                </div>
              </div>
            </div>

            {/* Feature Card 2: Granular Answer Review */}
            <div className="bg-[#FFFDF5] border-[3px] border-[#0F3D2E] rounded-[18px] shadow-[9px_9px_0_#0F3D2E] flex flex-col justify-between hover:-translate-y-1 hover:shadow-[11px_11px_0_#0F3D2E] transition-all p-7 sm:p-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 text-[#0F3D2E] bg-[#FFE94A] border-2 border-[#0F3D2E] px-3 py-1 rounded-full text-xs font-bold shadow-[2px_2px_0_#0F3D2E]">
                  <BarChart3 className="h-3.5 w-3.5 text-[#0F3D2E]" />
                  In-Depth Feedback
                </div>
                <h3 className="text-2xl font-[family-name:var(--font-display)] font-bold text-[#0F3D2E] tracking-tight">
                  Answer Breakdown
                </h3>
                <p className="text-sm text-[#0F3D2E]/80 leading-relaxed font-medium">
                  Compare your choices against verified solutions with color-coded filters for correct, incorrect, and skipped questions.
                </p>
              </div>

              <div className="space-y-3 pt-6 mt-4 border-t-2 border-dashed border-[#0F3D2E]/20">
                <div className="h-4 w-full rounded-full bg-[#E3F9EE] border-2 border-[#0F3D2E] overflow-hidden flex shadow-inner">
                  <div className="bg-[#1F9D6B] w-[70%]" title="Correct: 70%" />
                  <div className="bg-[#E5484D] w-[20%]" title="Incorrect: 20%" />
                  <div className="bg-[#FFE94A] w-[10%]" title="Skipped: 10%" />
                </div>
                <div className="flex justify-between text-xs font-bold text-[#0F3D2E] pt-1">
                  <span className="text-[#1F9D6B]">✓ 7 Correct</span>
                  <span className="text-[#E5484D]">✗ 2 Incorrect</span>
                  <span className="text-[#0F3D2E]/70">1 Skipped</span>
                </div>
              </div>
            </div>

            {/* Feature Card 3: Diverse Topic Curriculum */}
            <div className="bg-[#FFFDF5] border-[3px] border-[#0F3D2E] rounded-[18px] shadow-[9px_9px_0_#0F3D2E] flex flex-col justify-between hover:-translate-y-1 hover:shadow-[11px_11px_0_#0F3D2E] transition-all p-7 sm:p-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 text-[#0F3D2E] bg-[#FFE94A] border-2 border-[#0F3D2E] px-3 py-1 rounded-full text-xs font-bold shadow-[2px_2px_0_#0F3D2E]">
                  <Layers className="h-3.5 w-3.5 text-[#0F3D2E]" />
                  Rich Curriculum
                </div>
                <h3 className="text-2xl font-[family-name:var(--font-display)] font-bold text-[#0F3D2E] tracking-tight">
                  Topic Domains &amp; Tiers
                </h3>
                <p className="text-sm text-[#0F3D2E]/80 leading-relaxed font-medium">
                  From foundational programming syntax to complex distributed system architectures across multiple difficulty tiers.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-6 mt-4 border-t-2 border-dashed border-[#0F3D2E]/20">
                {["JavaScript", "React & Next.js", "Data Structures", "Algorithms", "Python", "SQL & Databases", "System Design"].map((cat) => (
                  <span
                    key={cat}
                    className="px-2.5 py-1 text-xs font-bold bg-[#E3F9EE] border-2 border-[#0F3D2E] rounded-[8px] text-[#0F3D2E] hover:bg-[#FFE94A] transition-colors"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </IntroGate>
  );
}
