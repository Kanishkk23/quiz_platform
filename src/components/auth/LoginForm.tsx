"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, ArrowRight, Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { OAuthButtons } from "@/components/auth/OAuthButtons";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const emailParam = searchParams.get("email") || "";

  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formData, setFormData] = useState({
    email: emailParam,
    password: "",
  });

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;

    setIsLoading(true);

    const result = await login(formData.email, formData.password);

    if (!result.success) {
      setIsLoading(false);
      setServerError(result.error || "Failed to sign in. Please check your credentials.");
      return;
    }

    setIsLoading(false);
    const targetUrl = redirectParam || "/quizzes";
    router.push(targetUrl);
  };

  const registerHref = redirectParam
    ? `/register?redirect=${encodeURIComponent(redirectParam)}`
    : "/register";

  const inputClass =
    "h-11 bg-[#FFFDF5] border-2 border-[#0F3D2E] text-[#0F3D2E] font-medium rounded-[10px] placeholder:text-[#0F3D2E]/40 focus-visible:ring-[#0F3D2E]";

  return (
    <div className="relative w-full max-w-md rounded-[22px] border-[3px] border-[#0F3D2E] bg-[#FFFDF5] p-6 pt-9 text-[#0F3D2E] shadow-[9px_9px_0_#0F3D2E] sm:p-8 sm:pt-10">
      {/* Tape */}
      <span
        aria-hidden="true"
        className="absolute -top-3 left-8 h-6 w-24 -rotate-3 border border-[#0F3D2E]/30 bg-[#FFE94A]/90"
      />

      <div className="mb-6 space-y-2">
        <p className="font-mono text-xs font-bold uppercase tracking-wider text-[#0F3D2E]/70">
          Q1. Who are you?
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-4xl font-extrabold leading-none tracking-tight">
          Welcome{" "}
          <span className="bg-[linear-gradient(transparent_58%,#FFE94A_58%)]">back</span>
        </h1>
        <p className="text-sm font-medium text-[#0F3D2E]/75">
          Enter your credentials to access your account &amp; compete
        </p>

        {redirectParam && (
          <div className="mt-3 flex items-center gap-2 rounded-[10px] border-2 border-[#0F3D2E] bg-[#FFE94A] p-3 text-left text-xs font-bold text-[#0F3D2E] shadow-[3px_3px_0_#0F3D2E]">
            <Lock className="h-4 w-4 shrink-0 text-[#0F3D2E]" />
            <span>
              <strong>Login Required:</strong> Please sign in to attempt your chosen quiz. You will
              be redirected right back!
            </span>
          </div>
        )}

        {serverError && (
          <div
            role="alert"
            className="mt-3 flex items-start gap-2 rounded-[10px] border-2 border-[#0F3D2E] bg-[#E5484D]/15 p-3 text-left text-xs font-bold text-[#E5484D] shadow-[3px_3px_0_#0F3D2E]"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#E5484D]" />
            <span>{serverError}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="email" className="font-mono text-xs font-bold uppercase tracking-wider text-[#0F3D2E]">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={`${inputClass} ${errors.email ? "border-[#E5484D]" : ""}`}
          />
          {errors.email && <p className="text-xs font-bold text-[#E5484D]">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="font-mono text-xs font-bold uppercase tracking-wider text-[#0F3D2E]">
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="text-xs font-bold text-[#0F3D2E]/70 transition-colors hover:text-[#0F3D2E] hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className={`${inputClass} pr-10 ${errors.password ? "border-[#E5484D]" : ""}`}
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0F3D2E]/70 hover:text-[#0F3D2E]"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs font-bold text-[#E5484D]">{errors.password}</p>}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="mt-2 w-full rounded-[12px] border-2 border-[#0F3D2E] bg-[#FFE94A] py-5 text-base font-extrabold text-[#0F3D2E] shadow-[5px_5px_0_#0F3D2E] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[#FFE94A] hover:shadow-[8px_8px_0_#0F3D2E] active:translate-x-1 active:translate-y-1 active:shadow-none"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#0F3D2E]" />
              Signing in...
            </>
          ) : (
            <>
              Sign In &amp; Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <OAuthButtons redirectParam={redirectParam} onError={(err) => setServerError(err)} />

      <div className="mt-6 text-center text-sm font-semibold text-[#0F3D2E]/80">
        Don&apos;t have an account?{" "}
        <Link
          href={registerHref}
          className="rounded bg-[linear-gradient(transparent_58%,#FFE94A_58%)] px-1 py-0.5 font-bold text-[#0F3D2E] transition-all hover:bg-[#FFE94A]"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}