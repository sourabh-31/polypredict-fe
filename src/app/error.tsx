"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Route Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-destructive/10">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Something went wrong
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">
            An unexpected error occurred. Please try again.
          </p>
        </div>

        <div className="flex justify-center gap-3">
          <Button onClick={reset} variant="outline">
            Try Again
          </Button>
          <Button onClick={() => (window.location.href = "/")}>Go Home</Button>
        </div>
      </div>
    </div>
  );
}
