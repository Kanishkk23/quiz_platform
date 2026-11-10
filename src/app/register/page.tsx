import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { AuthShell } from "@/components/auth/AuthShell";

export default function RegisterPage() {
  return (
    <AuthShell variant="register">
      <Suspense
        fallback={
          <div className="flex h-32 w-full max-w-md items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0F3D2E] border-t-transparent" />
          </div>
        }
      >
        <RegisterForm />
      </Suspense>
    </AuthShell>
  );
}