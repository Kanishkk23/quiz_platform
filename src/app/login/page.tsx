import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { AuthShell } from "@/components/auth/AuthShell";
import { ChipsLoader } from "@/components/fx/Loaders";

export default function LoginPage() {
  return (
    <AuthShell variant="login">
      <Suspense
        fallback={
          <div className="flex h-48 w-full max-w-md items-center justify-center">
            <ChipsLoader />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}