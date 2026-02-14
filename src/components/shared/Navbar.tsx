"use client";

import {
  Briefcase,
  LayoutDashboard,
  LogOut,
  Moon,
  RotateCcw,
  Sun,
  TrendingUp,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { usePathname } from "next/navigation";
import { useTheme } from "@/store/themeStore";
import { INITIAL_BALANCE, useWalletStore } from "@/store/walletStore";
import { useSession, signOut } from "next-auth/react";
import { Skeleton } from "../ui/skeleton";

export default function Navbar() {
  const pathname = usePathname();

  const { data: session, status } = useSession();

  const { isDark, toggleTheme } = useTheme();

  const balance = useWalletStore((state) => state.balance);
  const resetWallet = useWalletStore((state) => state.resetWallet);

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/positions", label: "Positions", icon: Briefcase },
  ];

  // Get initials from name for avatar fallback
  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center transition-transform group-hover:scale-105">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg hidden sm:block">
              PolyPredict
            </span>
          </Link>

          {/* Center Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              const Icon = item.icon;
              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    className="gap-2 cursor-pointer"
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Wallet Balance */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border">
              <Wallet className="w-4 h-4 text-primary" />
              <span className="font-semibold text-sm">
                ${balance.toFixed(2)}
              </span>
            </div>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full cursor-pointer"
            >
              {isDark ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                {status === "loading" ? (
                  <Skeleton className="w-9 h-9 rounded-full" />
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full cursor-pointer"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage
                        src={session?.user?.image || ""}
                        alt={session?.user?.name || "User"}
                      />
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {getInitials(session?.user?.name || "")}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="font-medium truncate">{session?.user?.name}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {session?.user?.email}
                  </p>
                </div>
                <DropdownMenuSeparator />

                {/* Mobile Balance */}
                <div className="sm:hidden px-2 py-1.5 flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-primary" />
                  <span className="font-semibold">${balance.toFixed(2)}</span>
                </div>
                <DropdownMenuSeparator className="sm:hidden" />

                {/* Mobile Nav */}
                <div className="md:hidden">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <DropdownMenuItem key={item.path} asChild>
                        <Link
                          href={item.path}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Icon className="w-4 h-4" />
                          {item.label}
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                  <DropdownMenuSeparator />
                </div>

                <DropdownMenuItem
                  onClick={resetWallet}
                  className="text-amber-500 focus:text-amber-500 cursor-pointer font-medium"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset Wallet (${INITIAL_BALANCE})
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="text-destructive focus:text-destructive cursor-pointer font-medium"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
