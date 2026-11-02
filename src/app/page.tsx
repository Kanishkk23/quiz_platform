import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Brain,
  Trophy,
  Clock,
  Users,
  Zap,
  Target,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Diverse Quizzes",
    description:
      "From JavaScript to System Design — test your knowledge across multiple domains.",
  },
  {
    icon: Clock,
    title: "Timed Challenges",
    description:
      "Race against the clock to answer questions and prove your speed.",
  },
  {
    icon: Trophy,
    title: "Live Leaderboard",
    description:
      "Compete with others and climb the ranks on our real-time leaderboard.",
  },
  {
    icon: Target,
    title: "Instant Results",
    description:
      "Get your score immediately after submission with a detailed breakdown.",
  },
  {
    icon: Users,
    title: "Community Driven",
    description:
      "Join a growing community of learners and quiz enthusiasts.",
  },
  {
    icon: Zap,
    title: "Fast & Responsive",
    description:
      "Seamless experience across desktop, tablet, and mobile devices.",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background px-4 py-1.5 text-sm font-medium text-muted-foreground shadow-sm">
              <Zap className="h-4 w-4 text-yellow-500" />
              Challenge your knowledge today
            </div>
            <h1 className="mb-6 text-4xl font-extrabold tracking-tight md:text-6xl lg:text-7xl">
              Test Your{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Knowledge
              </span>
            </h1>
            <p className="mb-10 text-lg text-muted-foreground md:text-xl">
              Take quizzes, compete with friends, and climb the leaderboard.
              Choose from a variety of topics and difficulty levels to sharpen
              your skills.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/quizzes">
                <Button size="lg" className="gap-2 text-base">
                  Start a Quiz
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/leaderboard">
                <Button variant="outline" size="lg" className="gap-2 text-base">
                  <Trophy className="h-4 w-4" />
                  View Leaderboard
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="pointer-events-none absolute -top-40 right-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 left-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
              Why QuizPlatform?
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Everything you need for an engaging quiz experience — all in one
              place.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="group border bg-card transition-all hover:shadow-md"
              >
                <CardContent className="flex flex-col gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="mb-1 text-lg font-semibold">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-muted/30 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-2xl font-bold tracking-tight md:text-3xl">
            Ready to test yourself?
          </h2>
          <p className="mb-8 text-muted-foreground">
            Create an account and start taking quizzes in seconds.
          </p>
          <Link href="/register">
            <Button size="lg" className="gap-2">
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
