import IntroGate from "@/components/intro/IntroGate";
import LandingPage from "@/components/landing/LandingPage";

export default function Home() {
  return (
    <IntroGate variant="cube">
      <LandingPage />
    </IntroGate>
  );
}
