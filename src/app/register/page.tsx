import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { AuthShell } from "@/components/auth/AuthShell";
import { ChipsLoader } from "@/components/fx/Loaders";

export default function RegisterPage() {
  return (
    <AuthShell variant="register">
      <Suspense
        fallback={
          <div className="flex h-48 w-full max-w-md items-center justify-center">
            <ChipsLoader />
          </div>
        }
      >
        <RegisterForm />
      </Suspense>
    </AuthShell>
  );
}