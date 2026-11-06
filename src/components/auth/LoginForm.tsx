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
import { Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { QuizoraLogo } from "@/components/layout/QuizoraLogo";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");

  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const [formData, setFormData] = useState({
    email: "",
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
    if (!validate()) return;

    setIsLoading(true);

    // Mock login — simulates network request
    await new Promise((resolve) => setTimeout(resolve, 600));
    await login(formData.email);

    setIsLoading(false);
    const targetUrl = redirectParam || "/quizzes";
    router.push(targetUrl);
  };

  const registerHref = redirectParam
    ? `/register?redirect=${encodeURIComponent(redirectParam)}`
    : "/register";

  return (
    <Card className="w-full max-w-md bg-[#FFFDF5] border-[3px] border-[#0F3D2E] rounded-[18px] shadow-[9px_9px_0_#0F3D2E] text-[#0F3D2E]">
      <CardHeader className="space-y-3 text-center">
        <div className="mx-auto flex items-center justify-center pt-2 pb-1">
          <QuizoraLogo className="h-12 sm:h-14 w-auto" />
        </div>
        <CardTitle className="text-2xl font-[family-name:var(--font-display)] font-extrabold tracking-tight text-[#0F3D2E]">
          Welcome back
        </CardTitle>
        <CardDescription className="text-sm font-medium text-[#0F3D2E]/75">
          Enter your credentials to access your account &amp; compete
        </CardDescription>

        {redirectParam && (
          <div className="mt-3 flex items-center gap-2 rounded-[10px] border-2 border-[#0F3D2E] bg-[#FFE94A] p-3 text-xs font-bold text-[#0F3D2E] text-left shadow-[3px_3px_0_#0F3D2E]">
            <Lock className="h-4 w-4 shrink-0 text-[#0F3D2E]" />
            <span>
              <strong>Login Required:</strong> Please sign in to attempt your chosen quiz. You will be redirected right back!
            </span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="font-bold text-xs uppercase tracking-wider text-[#0F3D2E]">
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
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="font-bold text-xs uppercase tracking-wider text-[#0F3D2E]">
                Password
              </Label>
              <span className="text-xs font-bold text-[#0F3D2E]/70 hover:underline cursor-pointer">
                Forgot password?
              </span>
            </div>
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

          <Button
            type="submit"
            className="w-full bg-[#FFE94A] hover:bg-[#FFE94A] text-[#0F3D2E] border-2 border-[#0F3D2E] font-bold rounded-[12px] shadow-[4px_4px_0_#0F3D2E] hover:shadow-[6px_6px_0_#0F3D2E] active:translate-y-0.5 active:shadow-none transition-all py-5 text-base mt-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#0F3D2E]" />
                Signing in...
              </>
            ) : (
              "Sign In & Continue"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm font-semibold text-[#0F3D2E]/80">
          Don&apos;t have an account?{" "}
          <Link
            href={registerHref}
            className="font-bold text-[#0F3D2E] bg-[linear-gradient(transparent_58%,#FFE94A_58%)] hover:bg-[#FFE94A] px-1 py-0.5 rounded transition-all"
          >
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
