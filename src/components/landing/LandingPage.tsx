import Link from "next/link";
import Backdrop from "./Backdrop";
import QuizPreview from "./QuizPreview";
import QuizoraMark from "../intro/QuizoraMark";
import { Arrow, Bolt, CheckCircle, Hourglass, Sparkle } from "./Icons";
import s from "./landing.module.css";
import { SmoothScroll } from "./SmoothScroll";
import HeroFloaters from "./HeroFloaters";
import { ScrollMarquee } from "./ScrollMarquee";
import { LandingStory } from "./LandingStory";
import { StatsStrip } from "./StatsStrip";
import { WarmUp } from "./WarmUp";
import { FinalCta } from "./FinalCta";

/**
 * Landing page: animated hero, then a scroll-driven story, live stats, a playable
 * warm-up question and a closing call to action.
 */
export default function LandingPage() {
  return (
    <>
      <SmoothScroll />

      <div className={s.page}>
        <Backdrop />
        <HeroFloaters />

        <header className={s.header}>
          <Link href="/" className={s.brand} aria-label="Quizora home">
            <QuizoraMark size={44} className={s.brandMark} />
            <span className={s.brandName}>quizora</span>
            <span className={s.brandTag}>-B</span>
          </Link>
          <nav className={s.nav} aria-label="Account">
            <Link href="/login" className={s.navLink}>
              Login
            </Link>
            <Link href="/register" className={s.navCta}>
              Sign Up
            </Link>
          </nav>
        </header>

        <main className={s.hero}>
          <div className={s.copy}>
            <span className={s.chip}>
              <Bolt width={14} height={14} /> Live Competitive Quiz Arena
            </span>

            <h1 className={s.title}>
              <span className={s.t1}>Master Any Topic.</span>
              <span className={s.t2}>Beat the Clock.</span>
              <span className={s.t3}>Climb the Ranks.</span>
            </h1>

            <p className={s.lead}>
              Take timed quizzes, test your speed against adaptive countdowns, and review detailed
              question-by-question solutions with verified answer explanations.
            </p>

            <Link href="/quizzes" className={s.cta}>
              Start a Quiz <Arrow width={20} height={20} />
            </Link>

            <ul className={s.perks}>
              <li className={s.perk}>
                <CheckCircle width={18} height={18} /> Curated Challenge Questions
              </li>
              <li className={s.perk}>
                <Sparkle width={18} height={18} /> Real-time Scoring
              </li>
              <li className={s.perk}>
                <Hourglass width={18} height={18} /> Quiz &amp; Per-Question Timers
              </li>
            </ul>
          </div>

          <QuizPreview />
        </main>
      </div>

      <ScrollMarquee items={["Answer fast", "Beat the clock", "Climb the ranks", "Retakes allowed"]} />
      <LandingStory />
      <StatsStrip />
      <WarmUp />
      <FinalCta />
    </>
  );
}