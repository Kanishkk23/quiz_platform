import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HeroQuizPreview } from "@/components/home/HeroQuizPreview";
import {
  Clock,
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle2,
  BarChart3,
  Layers,
  Hourglass,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Split Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#9CAF88]/10 via-background to-background pt-12 pb-20 md:pt-20 md:pb-32 border-b border-border/80">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline & Action */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Top Announcement Pill */}
              <div className="inline-flex items-center gap-2 rounded-full border border-[#CC5500]/30 bg-[#CC5500]/10 px-4 py-1.5 text-xs font-semibold text-[#CC5500] shadow-xs">
                <Zap className="h-3.5 w-3.5 text-[#CC5500] fill-[#CC5500]" />
                Live Competitive Quiz Arena
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground leading-[1.1]">
                Master Any Topic. <br className="hidden sm:inline" />
                Beat the Clock. <br />
                <span className="bg-gradient-to-r from-[#CC5500] via-[#D97706] to-[#607C52] bg-clip-text text-transparent">
                  Climb the Ranks.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Take timed quizzes, test your speed against adaptive countdowns,
                and review detailed question-by-question solutions with verified answer explanations.
              </p>

              {/* CTA Button */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link href="/quizzes" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto gap-2 font-semibold text-base px-8 h-12 shadow-md shadow-[#CC5500]/25 bg-[#CC5500] hover:bg-[#B34700] text-white">
                    Start a Quiz
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              {/* Trust & Feature Badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4 text-xs font-medium text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-[#607C52]" />
                  <span>Curated Challenge Questions</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-[#CC5500]" />
                  <span>Real-time Scoring</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Hourglass className="h-4 w-4 text-[#9CAF88]" />
                  <span>Quiz & Per-Question Timers</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Live Quiz Card Preview */}
            <div className="lg:col-span-5 flex justify-center">
              <HeroQuizPreview />
            </div>
          </div>
        </div>

        {/* Ambient Glow Blobs in Sage Green & Burnt Amber */}
        <div className="pointer-events-none absolute -top-24 right-10 h-80 w-80 rounded-full bg-[#9CAF88]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-10 h-80 w-80 rounded-full bg-[#CC5500]/15 blur-3xl" />
      </section>

      {/* Modern Features Grid Section (3-Column Balanced Triad Layout) */}
      <section className="py-20 md:py-28 bg-[#9CAF88]/5">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <Badge variant="outline" className="font-semibold text-xs uppercase tracking-wider text-[#CC5500] border-[#CC5500]/30 bg-[#CC5500]/5">
              Built for Performance & Learning
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Everything you need for a competitive quiz experience
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              A comprehensive platform engineered with clean UX, modern timer modes, and granular performance review.
            </p>
          </div>

          {/* Features Grid: 3 balanced cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature Card 1: Adaptive Quiz Timers */}
            <Card className="border border-border/90 bg-card/90 shadow-sm flex flex-col justify-between h-full hover:shadow-md hover:border-[#607C52]/40 transition-all">
              <CardContent className="p-6 sm:p-8 space-y-6 flex flex-col justify-between h-full">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[#607C52] font-bold text-xs uppercase tracking-wider">
                    <Clock className="h-4 w-4 text-[#607C52]" />
                    Flexible Timing
                  </div>
                  <h3 className="text-xl font-bold tracking-tight">
                    Adaptive Quiz Timers
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Switch seamlessly between an overall quiz countdown or a high-intensity 30s per-question timer with automatic question advance.
                  </p>
                </div>

                <div className="space-y-2 pt-4">
                  <div className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-muted/40 text-xs font-medium">
                    <span className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-[#607C52]" />
                      Full Quiz Mode
                    </span>
                    <Badge variant="secondary" className="text-[10px] bg-[#9CAF88]/20 text-[#2B3B24]">Standard limit</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg border border-[#CC5500]/30 bg-[#CC5500]/10 text-xs font-semibold text-[#CC5500]">
                    <span className="flex items-center gap-2">
                      <Hourglass className="h-3.5 w-3.5 text-[#CC5500]" />
                      Per-Question Blitz
                    </span>
                    <Badge className="text-[10px] bg-[#CC5500] text-white">30s / Q</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feature Card 2: Granular Answer Review */}
            <Card className="border border-border/90 bg-card/90 shadow-sm flex flex-col justify-between h-full hover:shadow-md hover:border-[#607C52]/40 transition-all">
              <CardContent className="p-6 sm:p-8 space-y-6 flex flex-col justify-between h-full">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[#607C52] font-bold text-xs uppercase tracking-wider">
                    <BarChart3 className="h-4 w-4 text-[#607C52]" />
                    In-Depth Feedback
                  </div>
                  <h3 className="text-xl font-bold tracking-tight">
                    Answer Breakdown
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Compare your choices against verified solutions with color-coded filters for correct, incorrect, and skipped questions.
                  </p>
                </div>

                <div className="space-y-2 pt-4">
                  <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden flex shadow-inner">
                    <div className="bg-[#607C52] w-[70%]" title="Correct: 70%" />
                    <div className="bg-[#D93829] w-[20%]" title="Incorrect: 20%" />
                    <div className="bg-[#A7A7A7] w-[10%]" title="Skipped: 10%" />
                  </div>
                  <div className="flex justify-between text-[11px] text-muted-foreground font-medium pt-1">
                    <span className="text-[#607C52] font-semibold">✓ 7 Correct</span>
                    <span className="text-[#D93829] font-semibold">✗ 2 Incorrect</span>
                    <span className="text-[#A7A7A7]">1 Skipped</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feature Card 3: Diverse Topic Curriculum */}
            <Card className="border border-border/90 bg-card/90 shadow-sm flex flex-col justify-between h-full hover:shadow-md hover:border-[#CC5500]/40 transition-all">
              <CardContent className="p-6 sm:p-8 space-y-6 flex flex-col justify-between h-full">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[#CC5500] font-bold text-xs uppercase tracking-wider">
                    <Layers className="h-4 w-4 text-[#CC5500]" />
                    Rich Curriculum
                  </div>
                  <h3 className="text-xl font-bold tracking-tight">
                    Topic Domains & Tiers
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    From foundational programming syntax to complex distributed system architectures across multiple difficulty tiers.
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-4">
                  {["JavaScript", "React & Next.js", "Data Structures", "Algorithms", "Python", "SQL & Databases", "System Design"].map((cat) => (
                    <Badge
                      key={cat}
                      variant="secondary"
                      className="px-2.5 py-1 text-xs font-medium bg-[#9CAF88]/15 border border-[#9CAF88]/30 text-foreground hover:bg-[#9CAF88]/25"
                    >
                      {cat}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
