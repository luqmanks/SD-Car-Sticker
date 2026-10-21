"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/hooks/use-session";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api("/api/auth/login", "POST", { email, password });
      router.push("/");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#F5F5F5] px-4">
      <Card className="w-full max-w-[450px]">
        <CardHeader>
          <div className="flex items-center">
            <Image src="/images/sd-logo.svg" alt="SD Car Sticker logo" width={36} height={36} className="mr-2" />
            <CardTitle>Login to SD Car Sticker</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-sm text-[#F44336]">{error}</p>}
              <Button type="submit" disabled={submitting} className="bg-[#00A86B] hover:bg-[#008f5b]">
                {submitting ? "Logging in..." : "Login"}
              </Button>
              <div className="text-sm text-gray-500 mt-2">
                Don&apos;t have an account? <a href="/register" className="underline">Register</a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
