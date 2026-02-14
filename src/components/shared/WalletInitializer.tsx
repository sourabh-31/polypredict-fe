"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useWalletStore } from "@/store/walletStore";

// Initializes the wallet state from localStorage

export function WalletInitializer() {
  const { data: session, status } = useSession();
  const initializeWallet = useWalletStore((s) => s.initializeWallet);

  useEffect(() => {
    if (status === "loading") return;

    initializeWallet(session?.user?.id ?? null);
  }, [session, status, initializeWallet]);

  return null;
}
