"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ArrowLeft, Copy, Check, KeyRound } from "lucide-react";
import Image from "next/image";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.forgotPassword(email);
      const token = res.data.token;
      setResetUrl(`${window.location.origin}/reset-password?token=${token}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate reset link");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(resetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-r from-primary-light to-primary px-4">
      <Card className="w-full max-w-md shadow-2xl p-8">
        <CardHeader className="text-center p-0 mb-6 flex flex-col items-center gap-2">
          <Link href="/" className="flex items-center justify-center gap-2 w-fit">
            <Image src="/logo.svg" alt="Logo" width={200} height={50} />
          </Link>
          <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
          <CardDescription className="text-sm">
            Enter your admin email to generate a reset link
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          {resetUrl ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-200">
                <KeyRound className="w-5 h-5 text-green-600 shrink-0" />
                <p className="text-sm text-green-700 font-medium">
                  Reset link generated
                </p>
              </div>

              <p className="text-sm text-muted-foreground">
                Copy the link below and open it in your browser to reset your password. It expires in 1 hour.
              </p>

              <div className="rounded-xl border border-border bg-muted p-3 text-xs break-all font-mono text-foreground">
                {resetUrl}
              </div>

              <div className="flex flex-col gap-2">
                <Button onClick={handleCopy} variant="outline" className="w-full">
                  {copied ? (
                    <>
                      <Check className="mr-2 h-4 w-4 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Link
                    </>
                  )}
                </Button>
                <Link href={resetUrl}>
                  <Button className="w-full">Open Reset Page</Button>
                </Link>
              </div>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Back to Login
                </Link>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? "Generating…" : "Generate Reset Link"}
                </Button>
              </form>
              <div className="mt-4 text-center">
                <Link
                  href="/login"
                  className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
