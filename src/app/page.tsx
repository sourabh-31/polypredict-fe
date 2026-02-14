"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { TrendingUp } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm flex flex-col items-center text-center space-y-6">
        {/* Logo */}
        <div className="flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
            <TrendingUp className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="font-bold text-2xl tracking-tight">PolyPredict</span>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-xl font-semibold">
            Sign in to continue predicting the future.
          </h1>
        </div>

        {/* Sign In Button */}
        <Button size="lg" className="w-full" onClick={() => signIn("google")}>
          Sign in with Google
        </Button>
      </div>
    </main>
  );
}
