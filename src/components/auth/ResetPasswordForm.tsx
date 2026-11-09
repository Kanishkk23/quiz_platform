"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { QuizoraLogo } from "@/components/layout/QuizoraLogo";

export function ResetPasswordForm() {
  const router = useRouter();
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});

  const validate = () => {
    const newErrors: { password?: string; confirmPassword?: string } = {};

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;

    setIsLoading(true);

    const result = await updatePassword(password);

    setIsLoading(false);

    if (!result.success) {
      setServerError(
        result.error || "Failed to update password. Your reset link may have expired."
      );
      return;
    }

    setIsSuccess(true);
    setTimeout(() => {
      router.push("/login");
    }, 2000);
  };

  return (
    <Card className="w-full max-w-md bg-[#FFFDF5] border-[3px] border-[#0F3D2E] rounded-[18px] shadow-[9px_9px_0_#0F3D2E] text-[#0F3D2E]">
      <CardHeader className="space-y-3 text-center">
        <div className="mx-auto flex items-center justify-center pt-2 pb-1">
          <QuizoraLogo className="h-12 sm:h-14 w-auto" />
        </div>
        <CardTitle className="text-2xl font-[family-name:var(--font-display)] font-extrabold tracking-tight text-[#0F3D2E]">
          Set New Password
        </CardTitle>
        <CardDescription className="text-sm font-medium text-[#0F3D2E]/75">
          Enter your new password below to secure your account
        </CardDescription>

        {serverError && (
          <div className="mt-3 flex items-start gap-2 rounded-[10px] border-2 border-[#0F3D2E] bg-[#E5484D]/15 p-3 text-xs font-bold text-[#E5484D] text-left shadow-[3px_3px_0_#0F3D2E]">
            <AlertCircle className="h-4 w-4 shrink-0 text-[#E5484D] mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        {isSuccess && (
          <div className="mt-3 flex items-start gap-2 rounded-[10px] border-2 border-[#0F3D2E] bg-[#E3F9EE] p-3 text-xs font-bold text-[#0F3D2E] text-left shadow-[3px_3px_0_#0F3D2E]">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#0F3D2E] mt-0.5" />
            <span>
              Password reset successfully! Redirecting you to login in 2 seconds...
            </span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {!isSuccess ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="font-bold text-xs uppercase tracking-wider text-[#0F3D2E]"
              >
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                Confirm New Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                  Updating password...
                </>
              ) : (
                "Save New Password"
              )}
            </Button>
          </form>
        ) : (
          <div className="pt-2 text-center">
            <Link href="/login">
              <Button className="w-full bg-[#FFE94A] hover:bg-[#FFE94A] text-[#0F3D2E] border-2 border-[#0F3D2E] font-bold rounded-[12px] shadow-[4px_4px_0_#0F3D2E] py-5">
                Go to Sign In
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
