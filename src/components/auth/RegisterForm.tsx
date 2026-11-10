"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, ArrowRight, CheckCircle2, Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { OAuthButtons } from "@/components/auth/OAuthButtons";

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const strengthLabels = ["too short", "weak", "okay", "strong", "champion"];

function passwordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw) || /[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");

  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [userAlreadyExists, setUserAlreadyExists] = useState(false);
  const [verificationNotice, setVerificationNotice] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const validate = () => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

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

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const loginHref = redirectParam
    ? `/login?redirect=${encodeURIComponent(redirectParam)}&email=${encodeURIComponent(formData.email.trim())}`
    : `/login?email=${encodeURIComponent(formData.email.trim())}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setUserAlreadyExists(false);
    setVerificationNotice(null);
    if (!validate()) return;

    setIsLoading(true);

    const result = await register(formData.name.trim(), formData.email.trim(), formData.password);

    if (!result.success) {
      setIsLoading(false);

      if (result.userAlreadyExists) {
        setUserAlreadyExists(true);
        setServerError("An account with this email already exists! Redirecting you to login...");
        // Automatically redirect to login page after 2 seconds
        setTimeout(() => {
          router.push(loginHref);
        }, 2000);
        return;
      }

      setServerError(result.error || "Failed to create account. Please try again.");
      return;
    }

    setIsLoading(false);

    if (result.requiresEmailVerification) {
      setVerificationNotice(
        "Account created! Please check your email to verify your address, then sign in."
      );
      return;
    }

    const targetUrl = redirectParam || "/quizzes";
    router.push(targetUrl);
  };

  const strength = passwordStrength(formData.password);
  const inputClass =
    "h-11 bg-[#FFFDF5] border-2 border-[#0F3D2E] text-[#0F3D2E] font-medium rounded-[10px] placeholder:text-[#0F3D2E]/40 focus-visible:ring-[#0F3D2E]";
  const labelClass = "font-mono text-xs font-bold uppercase tracking-wider text-[#0F3D2E]";

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
          Create your{" "}
          <span className="bg-[linear-gradient(transparent_58%,#FFE94A_58%)]">account</span>
        </h1>
        <p className="text-sm font-medium text-[#0F3D2E]/75">
          Sign up to compete in quizzes and claim top leaderboard spots
        </p>

        {redirectParam && (
          <div className="mt-3 flex items-center gap-2 rounded-[10px] border-2 border-[#0F3D2E] bg-[#FFE94A] p-3 text-left text-xs font-bold text-[#0F3D2E] shadow-[3px_3px_0_#0F3D2E]">
            <Lock className="h-4 w-4 shrink-0 text-[#0F3D2E]" />
            <span>Create an account to begin your quiz attempt right away!</span>
          </div>
        )}

        {serverError && (
          <div
            role="alert"
            className="mt-3 flex flex-col gap-2 rounded-[10px] border-2 border-[#0F3D2E] bg-[#E5484D]/15 p-3 text-left text-xs font-bold text-[#E5484D] shadow-[3px_3px_0_#0F3D2E]"
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#E5484D]" />
              <span>{serverError}</span>
            </div>
            {userAlreadyExists && (
              <Link href={loginHref} className="pt-1">
                <Button
                  type="button"
                  size="sm"
                  className="h-8 w-full gap-1.5 rounded-[8px] border-2 border-[#0F3D2E] bg-[#FFE94A] text-xs font-bold text-[#0F3D2E] shadow-[2px_2px_0_#0F3D2E] hover:bg-[#FFE94A]"
                >
                  Go to Login Now <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            )}
          </div>
        )}

        {verificationNotice && (
          <div
            role="status"
            className="mt-3 flex items-start gap-2 rounded-[10px] border-2 border-[#0F3D2E] bg-[#E3F9EE] p-3 text-left text-xs font-bold text-[#0F3D2E] shadow-[3px_3px_0_#0F3D2E]"
          >
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#0F3D2E]" />
            <span>{verificationNotice}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="name" className={labelClass}>Full Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`${inputClass} ${errors.name ? "border-[#E5484D]" : ""}`}
          />
          {errors.name && <p className="text-xs font-bold text-[#E5484D]">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className={labelClass}>Email</Label>
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
          <Label htmlFor="password" className={labelClass}>Password</Label>
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
          {formData.password && (
            <div className="flex items-center gap-2" aria-live="polite">
              <div className="flex flex-1 gap-1.5">
                {[1, 2, 3, 4].map((segment) => (
                  <span
                    key={segment}
                    className={`h-2 flex-1 rounded-full border-2 border-[#0F3D2E] transition-colors ${
                      strength >= segment ? "bg-[#FFE94A]" : "bg-[#FFFDF5]"
                    }`}
                  />
                ))}
              </div>
              <span className="w-20 text-right font-mono text-[11px] font-bold uppercase">
                {strengthLabels[strength]}
              </span>
            </div>
          )}
          {errors.password && <p className="text-xs font-bold text-[#E5484D]">{errors.password}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className={labelClass}>Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className={`${inputClass} pr-10 ${errors.confirmPassword ? "border-[#E5484D]" : ""}`}
            />
            <button
              type="button"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0F3D2E]/70 hover:text-[#0F3D2E]"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs font-bold text-[#E5484D]">{errors.confirmPassword}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="mt-2 w-full rounded-[12px] border-2 border-[#0F3D2E] bg-[#FFE94A] py-5 text-base font-extrabold text-[#0F3D2E] shadow-[5px_5px_0_#0F3D2E] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[#FFE94A] hover:shadow-[8px_8px_0_#0F3D2E] active:translate-x-1 active:translate-y-1 active:shadow-none"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#0F3D2E]" />
              Creating account...
            </>
          ) : (
            <>
              Create Account
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <OAuthButtons redirectParam={redirectParam} onError={(err) => setServerError(err)} />

      <div className="mt-6 text-center text-sm font-semibold text-[#0F3D2E]/80">
        Already have an account?{" "}
        <Link
          href={loginHref}
          className="rounded bg-[linear-gradient(transparent_58%,#FFE94A_58%)] px-1 py-0.5 font-bold text-[#0F3D2E] transition-all hover:bg-[#FFE94A]"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}