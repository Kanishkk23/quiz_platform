import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div
      className="relative flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12 bg-[#BDF2D5]"
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
      <Suspense
        fallback={
          <div className="flex h-32 w-full max-w-md items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0F3D2E] border-t-transparent" />
          </div>
        }
      >
        <RegisterForm />
      </Suspense>
    </div>
  );
}
