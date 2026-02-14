"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { WalletInitializer } from "@/components/shared/WalletInitializer";

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <Toaster toastOptions={{ className: "font-display" }} />
        <WalletInitializer />
        {children}
      </QueryClientProvider>
    </SessionProvider>
  );
}
