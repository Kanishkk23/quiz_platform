"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, ArrowRight, CheckCircle2, Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { QuizoraLogo } from "@/components/layout/QuizoraLogo";

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
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

    const result = await register(
      formData.name.trim(),
      formData.email.trim(),
      formData.password
    );

    if (!result.success) {
      setIsLoading(false);

      if (result.userAlreadyExists) {
        setUserAlreadyExists(true);
        setServerError(
          "An account with this email already exists! Redirecting you to login..."
        );
        // Automatically redirect to login page after 2 seconds
        setTimeout(() => {
          router.push(loginHref);
        }, 2000);
        return;
      }

      setServerError(
        result.error || "Failed to create account. Please try again."
      );
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

  return (
    <Card className="w-full max-w-md bg-[#FFFDF5] border-[3px] border-[#0F3D2E] rounded-[18px] shadow-[9px_9px_0_#0F3D2E] text-[#0F3D2E]">
      <CardHeader className="space-y-3 text-center">
        <div className="mx-auto flex items-center justify-center pt-2 pb-1">
          <QuizoraLogo className="h-12 sm:h-14 w-auto" />
        </div>
        <CardTitle className="text-2xl font-[family-name:var(--font-display)] font-extrabold tracking-tight text-[#0F3D2E]">
          Create your account
        </CardTitle>
        <CardDescription className="text-sm font-medium text-[#0F3D2E]/75">
          Sign up to compete in quizzes and claim top leaderboard spots
        </CardDescription>

        {redirectParam && (
          <div className="mt-3 flex items-center gap-2 rounded-[10px] border-2 border-[#0F3D2E] bg-[#FFE94A] p-3 text-xs font-bold text-[#0F3D2E] text-left shadow-[3px_3px_0_#0F3D2E]">
            <Lock className="h-4 w-4 shrink-0 text-[#0F3D2E]" />
            <span>
              Create an account to begin your quiz attempt right away!
            </span>
          </div>
        )}

        {serverError && (
          <div className="mt-3 flex flex-col gap-2 rounded-[10px] border-2 border-[#0F3D2E] bg-[#E5484D]/15 p-3 text-xs font-bold text-[#E5484D] text-left shadow-[3px_3px_0_#0F3D2E]">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-[#E5484D] mt-0.5" />
              <span>{serverError}</span>
            </div>
            {userAlreadyExists && (
              <Link href={loginHref} className="pt-1">
                <Button
                  type="button"
                  size="sm"
                  className="w-full bg-[#FFE94A] hover:bg-[#FFE94A] text-[#0F3D2E] border-2 border-[#0F3D2E] font-bold rounded-[8px] shadow-[2px_2px_0_#0F3D2E] text-xs h-8 gap-1.5"
                >
                  Go to Login Now <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            )}
          </div>
        )}

        {verificationNotice && (
          <div className="mt-3 flex items-start gap-2 rounded-[10px] border-2 border-[#0F3D2E] bg-[#E3F9EE] p-3 text-xs font-bold text-[#0F3D2E] text-left shadow-[3px_3px_0_#0F3D2E]">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#0F3D2E] mt-0.5" />
            <span>{verificationNotice}</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="font-bold text-xs uppercase tracking-wider text-[#0F3D2E]"
            >
              Full Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className={`bg-[#FFFDF5] border-2 border-[#0F3D2E] text-[#0F3D2E] font-medium rounded-[10px] placeholder:text-[#0F3D2E]/40 focus-visible:ring-[#0F3D2E] ${
                errors.name ? "border-[#E5484D]" : ""
              }`}
            />
            {errors.name && (
              <p className="text-xs font-bold text-[#E5484D]">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="font-bold text-xs uppercase tracking-wider text-[#0F3D2E]"
            >
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className={`bg-[#FFFDF5] border-2 border-[#0F3D2E] text-[#0F3D2E] font-medium rounded-[10px] placeholder:text-[#0F3D2E]/40 focus-visible:ring-[#0F3D2E] ${
                errors.email ? "border-[#E5484D]" : ""
              }`}
            />
            {errors.email && (
              <p className="text-xs font-bold text-[#E5484D]">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="font-bold text-xs uppercase tracking-wider text-[#0F3D2E]"
            >
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className={`bg-[#FFFDF5] border-2 border-[#0F3D2E] text-[#0F3D2E] font-medium rounded-[10px] placeholder:text-[#0F3D2E]/40 focus-visible:ring-[#0F3D2E] pr-10 ${
                  errors.password ? "border-[#E5484D]" : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0F3D2E]/70 hover:text-[#0F3D2E]"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs font-bold text-[#E5484D]">{errors.password}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="confirmPassword"
              className="font-bold text-xs uppercase tracking-wider text-[#0F3D2E]"
            >
              Confirm Password
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                className={`bg-[#FFFDF5] border-2 border-[#0F3D2E] text-[#0F3D2E] font-medium rounded-[10px] placeholder:text-[#0F3D2E]/40 focus-visible:ring-[#0F3D2E] pr-10 ${
                  errors.confirmPassword ? "border-[#E5484D]" : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0F3D2E]/70 hover:text-[#0F3D2E]"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs font-bold text-[#E5484D]">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-[#FFE94A] hover:bg-[#FFE94A] text-[#0F3D2E] border-2 border-[#0F3D2E] font-bold rounded-[12px] shadow-[4px_4px_0_#0F3D2E] hover:shadow-[6px_6px_0_#0F3D2E] active:translate-y-0.5 active:shadow-none transition-all py-5 text-base mt-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#0F3D2E]" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm font-semibold text-[#0F3D2E]/80">
          Already have an account?{" "}
          <Link
            href={loginHref}
            className="font-bold text-[#0F3D2E] bg-[linear-gradient(transparent_58%,#FFE94A_58%)] hover:bg-[#FFE94A] px-1 py-0.5 rounded transition-all"
          >
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
