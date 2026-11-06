import { ProfileView } from "@/components/profile/ProfileView";

export const metadata = {
  title: "Profile & Attempt History — QuizPlatform",
  description: "View your quiz statistics, accuracy metrics, and attempt history.",
};

export default function ProfilePage() {
  return (
    <div
      className="min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 bg-[#BDF2D5]"
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
    >
      <ProfileView />
    </div>
  );
}
