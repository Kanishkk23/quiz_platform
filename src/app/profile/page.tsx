import { ProfileView } from "@/components/profile/ProfileView";

export const metadata = {
  title: "Profile & Attempt History — QuizPlatform",
  description: "View your quiz statistics, accuracy metrics, and attempt history.",
};

export default function ProfilePage() {
  return <ProfileView />;
}
