import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HeroQuizPreview } from "@/components/home/HeroQuizPreview";
import {
  Brain,
  Trophy,
  Clock,
  Target,
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle2,
  BarChart3,
  Layers,
  Medal,
  Hourglass,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Split Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-500/5 via-background to-background pt-12 pb-20 md:pt-20 md:pb-32 border-b">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline & Action */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Top Announcement Pill */}
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary shadow-xs">
                <Zap className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                Live Competitive Quiz Arena
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground leading-[1.1]">
                Master Any Topic. <br className="hidden sm:inline" />
                Beat the Clock. <br />
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Climb the Ranks.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Take timed quizzes, test your speed against adaptive countdowns,
                review detailed question-by-question solutions, and battle for the
                #1 spot on the global leaderboard.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link href="/quizzes" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto gap-2 font-semibold text-base px-7 h-12 shadow-md shadow-primary/20">
                    Start a Quiz
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/leaderboard" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto gap-2 font-medium text-base px-6 h-12 border-border/80"
                  >
                    <Trophy className="h-4 w-4 text-amber-500" />
                    Live Leaderboard
                  </Button>
                </Link>
              </div>

              {/* Trust & Feature Badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4 text-xs font-medium text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>50+ Curated Questions</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-blue-500" />
                  <span>Real-time Scoring</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Hourglass className="h-4 w-4 text-amber-500" />
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

        {/* Subtle Ambient Background Blobs */}
        <div className="pointer-events-none absolute -top-24 right-10 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-10 h-80 w-80 rounded-full bg-purple-500/10 blur-3xl" />
      </section>

      {/* Modern Bento Grid Features Section */}
      <section className="py-20 md:py-28 bg-muted/20">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <Badge variant="outline" className="font-semibold text-xs uppercase tracking-wider text-primary">
              Built for Performance & Learning
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Everything you need for a competitive quiz experience
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              A comprehensive platform engineered with clean UX, modern timer modes, and granular performance review.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bento Card 1: Live Leaderboard (Spans 2 columns on desktop) */}
            <Card className="md:col-span-2 border bg-card/90 shadow-sm overflow-hidden flex flex-col justify-between">
              <CardContent className="p-6 sm:p-8 space-y-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                      <Trophy className="h-4 w-4 text-amber-500" />
                      Competitive Ranking
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight">
                      Live Realtime Leaderboard
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-lg">
                      Watch rankings update dynamically as participants finish quizzes. Compete for the Gold, Silver, and Bronze podium.
                    </p>
                  </div>
                  <Link href="/leaderboard">
                    <Button variant="ghost" size="sm" className="hidden sm:flex gap-1 text-xs">
                      View Standings
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>

                {/* Mini Leaderboard Podium Showcase */}
                <div className="grid grid-cols-3 gap-3 pt-2 text-center">
                  <div className="rounded-xl border bg-muted/30 p-3 sm:p-4">
                    <Medal className="h-6 w-6 text-slate-400 mx-auto mb-1" />
                    <div className="text-xs font-semibold">Rank #2</div>
                    <div className="text-base font-bold">9 / 10</div>
                    <div className="text-[10px] text-muted-foreground">Accuracy: 90%</div>
                  </div>

                  <div className="rounded-xl border-2 border-amber-500/40 bg-amber-500/10 p-3 sm:p-4 transform -translate-y-1">
                    <Trophy className="h-7 w-7 text-amber-500 mx-auto mb-1" />
                    <div className="text-xs font-bold text-amber-700 dark:text-amber-300">👑 Champion</div>
                    <div className="text-lg font-black text-amber-600 dark:text-amber-400">10 / 10</div>
                    <div className="text-[10px] text-muted-foreground">Speed: 2m 15s</div>
                  </div>

                  <div className="rounded-xl border bg-muted/30 p-3 sm:p-4">
                    <Medal className="h-6 w-6 text-amber-700 mx-auto mb-1" />
                    <div className="text-xs font-semibold">Rank #3</div>
                    <div className="text-base font-bold">8 / 10</div>
                    <div className="text-[10px] text-muted-foreground">Accuracy: 80%</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bento Card 2: Dual Timer Modes */}
            <Card className="border bg-card/90 shadow-sm flex flex-col justify-between">
              <CardContent className="p-6 sm:p-8 space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                    <Clock className="h-4 w-4 text-blue-500" />
                    Flexible Timing
                  </div>
                  <h3 className="text-xl font-bold tracking-tight">
                    Adaptive Quiz Timers
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Switch seamlessly between an overall quiz countdown or a high-intensity 30s per-question timer with auto-advance.
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/40 text-xs font-medium">
                    <span className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      Full Quiz Mode
                    </span>
                    <Badge variant="secondary" className="text-[10px]">10 min limit</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg border bg-primary/10 border-primary/30 text-xs font-semibold text-primary">
                    <span className="flex items-center gap-2">
                      <Hourglass className="h-3.5 w-3.5 text-amber-500" />
                      Per-Question Blitz
                    </span>
                    <Badge className="text-[10px] bg-primary text-primary-foreground">30s / Q</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bento Card 3: Granular Answer Review */}
            <Card className="border bg-card/90 shadow-sm flex flex-col justify-between">
              <CardContent className="p-6 sm:p-8 space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                    <BarChart3 className="h-4 w-4 text-emerald-500" />
                    In-Depth Feedback
                  </div>
                  <h3 className="text-xl font-bold tracking-tight">
                    Answer Breakdown
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Compare your choices against the verified solutions with color-coded filters for correct, incorrect, and skipped questions.
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden flex">
                    <div className="bg-emerald-500 w-[70%]" title="Correct: 70%" />
                    <div className="bg-rose-500 w-[20%]" title="Incorrect: 20%" />
                    <div className="bg-slate-400 w-[10%]" title="Skipped: 10%" />
                  </div>
                  <div className="flex justify-between text-[11px] text-muted-foreground font-medium pt-1">
                    <span className="text-emerald-600 font-semibold">✓ 7 Correct</span>
                    <span className="text-rose-600 font-semibold">✗ 2 Incorrect</span>
                    <span>1 Skipped</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bento Card 4: Diverse Category Matrix (Spans 2 columns on desktop) */}
            <Card className="md:col-span-2 border bg-card/90 shadow-sm flex flex-col justify-between">
              <CardContent className="p-6 sm:p-8 space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                    <Layers className="h-4 w-4 text-purple-500" />
                    Rich Curriculum
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight">
                    Multiple Topic Domains & Difficulty Tiers
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    From foundational frontend syntax to complex distributed system architectures. Filter topics with instantaneous client-side search.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {["JavaScript", "React & Next.js", "Data Structures", "Algorithms", "Python", "SQL & Databases", "System Design"].map((cat) => (
                    <Badge
                      key={cat}
                      variant="secondary"
                      className="px-3 py-1 text-xs font-medium bg-muted/60 hover:bg-muted"
                    >
                      {cat}
                    </Badge>
                  ))}
                  <Badge variant="outline" className="px-3 py-1 text-xs border-dashed text-primary">
                    + More coming
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final Call to Action Section */}
      <section className="border-t bg-gradient-to-b from-background to-blue-500/5 py-16 md:py-24 text-center">
        <div className="container mx-auto px-4 max-w-4xl space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to test your knowledge?
          </h2>
          <p className="text-muted-foreground text-base max-w-xl mx-auto">
            Choose a challenge, test your speed against the clock, and earn your place at the top of the leaderboard.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/quizzes" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto gap-2 font-semibold px-8 h-12">
                Explore Quizzes
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/register" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto font-medium px-8 h-12">
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
