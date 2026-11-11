import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { AuthShell } from "@/components/auth/AuthShell";

export default function LoginPage() {
  return (
    <AuthShell variant="login">
      <Suspense
        fallback={
          <div className="flex h-32 w-full max-w-md items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0F3D2E] border-t-transparent" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}