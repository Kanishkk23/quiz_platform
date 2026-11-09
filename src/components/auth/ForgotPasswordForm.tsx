"use client";

import { useState } from "react";
import Link from "next/link";
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
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2, Mail } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { QuizoraLogo } from "@/components/layout/QuizoraLogo";

export function ForgotPasswordForm() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const validate = () => {
    if (!email.trim()) {
      setEmailError("Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;

    setIsLoading(true);

    const result = await resetPassword(email.trim());

    setIsLoading(false);

    if (!result.success) {
      setServerError(
        result.error || "Failed to send reset link. Please check your email and try again."
      );
      return;
    }

    setIsSuccess(true);
  };

  return (
    <Card className="w-full max-w-md bg-[#FFFDF5] border-[3px] border-[#0F3D2E] rounded-[18px] shadow-[9px_9px_0_#0F3D2E] text-[#0F3D2E]">
      <CardHeader className="space-y-3 text-center">
        <div className="mx-auto flex items-center justify-center pt-2 pb-1">
          <QuizoraLogo className="h-12 sm:h-14 w-auto" />
        </div>
        <CardTitle className="text-2xl font-[family-name:var(--font-display)] font-extrabold tracking-tight text-[#0F3D2E]">
          Reset your password
        </CardTitle>
        <CardDescription className="text-sm font-medium text-[#0F3D2E]/75">
          Enter your registered email and we&apos;ll send you a password recovery link
        </CardDescription>

        {serverError && (
          <div className="mt-3 flex items-start gap-2 rounded-[10px] border-2 border-[#0F3D2E] bg-[#E5484D]/15 p-3 text-xs font-bold text-[#E5484D] text-left shadow-[3px_3px_0_#0F3D2E]">
            <AlertCircle className="h-4 w-4 shrink-0 text-[#E5484D] mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        {isSuccess && (
          <div className="mt-3 flex flex-col gap-2 rounded-[10px] border-2 border-[#0F3D2E] bg-[#E3F9EE] p-3 text-xs font-bold text-[#0F3D2E] text-left shadow-[3px_3px_0_#0F3D2E]">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-[#0F3D2E] mt-0.5" />
              <span>
                Password reset link sent! Check your inbox (and spam folder) to reset your password.
              </span>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {!isSuccess ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="font-bold text-xs uppercase tracking-wider text-[#0F3D2E]"
              >
                Registered Email
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`bg-[#FFFDF5] border-2 border-[#0F3D2E] text-[#0F3D2E] font-medium rounded-[10px] placeholder:text-[#0F3D2E]/40 focus-visible:ring-[#0F3D2E] pr-10 ${
                    emailError ? "border-[#E5484D]" : ""
                  }`}
                />
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0F3D2E]/60 pointer-events-none" />
              </div>
              {emailError && (
                <p className="text-xs font-bold text-[#E5484D]">{emailError}</p>
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
                  Sending reset link...
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </form>
        ) : (
          <div className="pt-2 text-center">
            <Link href="/login">
              <Button className="w-full bg-[#FFE94A] hover:bg-[#FFE94A] text-[#0F3D2E] border-2 border-[#0F3D2E] font-bold rounded-[12px] shadow-[4px_4px_0_#0F3D2E] py-5">
                Return to Login
              </Button>
            </Link>
          </div>
        )}

        <div className="mt-6 text-center text-sm font-semibold text-[#0F3D2E]/80">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 font-bold text-[#0F3D2E] hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
