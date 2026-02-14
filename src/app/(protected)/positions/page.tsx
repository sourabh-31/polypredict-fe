"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useEvents } from "@/hooks/useEvents";
import { extractMarketPrices } from "@/lib/utils";
import { Position, useWalletStore } from "@/store/walletStore";
import { format } from "date-fns";
import {
  ArrowRight,
  Briefcase,
  Calendar,
  LineChart,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo } from "react";

type GroupedPosition = {
  eventId: string;
  eventTitle: string;
  eventImage?: string;
  eventEndDate?: string;
  positions: Position[];
};

export default function Positions() {
  const positions = useWalletStore((state) => state.positions);
  const calculatePnL = useWalletStore((state) => state.calculatePnL);
  const updatePositionPrices = useWalletStore(
    (state) => state.updatePositionPrices,
  );

  const { data: events } = useEvents();

  // Grouping positions by event to display them together in the UI. This allows us to show all positions related to a specific event under one card, making it easier for users to see their exposure and performance for each event at a glance.
  const groupedPositions = useMemo(() => {
    const grouped: Record<string, GroupedPosition> = {};

    for (const pos of positions) {
      if (!grouped[pos.eventId]) {
        grouped[pos.eventId] = {
          eventId: pos.eventId,
          eventTitle: pos.eventTitle,
          eventImage: pos.eventImage,
          eventEndDate: pos.eventEndDate,
          positions: [],
        };
      }

      grouped[pos.eventId].positions.push(pos);
    }

    return Object.values(grouped);
  }, [positions]);

  // Calculate total portfolio value
  const totalInvested = groupedPositions.reduce(
    (sum, group) =>
      sum + group.positions.reduce((s, p) => s + p.totalInvested, 0),
    0,
  );

  const totalPnL = groupedPositions.reduce(
    (sum, group) =>
      sum + group.positions.reduce((s, p) => s + calculatePnL(p).value, 0),
    0,
  );

  const totalPnLPercentage =
    totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

  // Update position prices whenever events data changes. This ensures that the unrealized P&L displayed to the user is always based on the latest market prices extracted from the events data.
  useEffect(() => {
    if (!events) return;
    updatePositionPrices(extractMarketPrices(events));
  }, [events]);

  // Empty state when user has no positions yet. Encourages them to explore the dashboard and start trading to see their positions here.
  if (groupedPositions.length === 0)
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
              <Briefcase className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No Positions Yet</h2>
            <p className="text-muted-foreground mb-8 max-w-sm leading-snug">
              Start trading to see your positions here. Head to the dashboard to
              explore markets.
            </p>
            <Link href="/dashboard">
              <Button size="lg">
                Go to Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10 lg:max-w-5xl">
        {/* Header */}

        <div className="mb-10">
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-3">
            <Briefcase className="w-7 h-7 text-primary" />
            Your Positions
          </h1>

          <p className="text-muted-foreground mt-2">
            View your open positions, average prices, and unrealized P&amp;L
            across events.
          </p>
        </div>

        {/* Portfolio Summary */}

        <Card className="mb-10 rounded-xl border border-border/60 shadow-sm">
          <div className="px-6 pt-6">
            <h2 className="text-lg font-semibold tracking-tight">
              Portfolio Summary
            </h2>
          </div>

          <div className="px-6 py-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
              {/* Total Invested */}
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Wallet className="w-4 h-4 opacity-70" />
                  Total Invested
                </div>
                <div className="text-2xl font-semibold tabular-nums">
                  ${totalInvested.toFixed(2)}
                </div>
              </div>

              {/* P&L */}
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  {totalPnL >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-success" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-danger" />
                  )}
                  Unrealized P&amp;L
                </div>
                <div
                  className={`text-2xl font-bold tabular-nums ${
                    totalPnL >= 0 ? "text-success" : "text-danger"
                  }`}
                >
                  {totalPnL >= 0 ? "+" : ""}${totalPnL.toFixed(2)}
                </div>
              </div>

              {/* Return */}
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <LineChart className="w-4 h-4 opacity-70" />
                  Return
                </div>
                <div
                  className={`text-2xl font-semibold tabular-nums ${
                    totalPnLPercentage >= 0 ? "text-success" : "text-danger"
                  }`}
                >
                  {totalPnLPercentage >= 0 ? "+" : ""}
                  {totalPnLPercentage.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Positions List */}

        <div className="space-y-6">
          {groupedPositions.map((group) => (
            <Card
              key={group.eventId}
              className="rounded-xl border border-border/60 shadow-sm"
            >
              {/* Event Header */}
              <div className="px-6 pt-6">
                <div className="flex items-start gap-4">
                  {group.eventImage && (
                    <img
                      src={group.eventImage}
                      alt={group.eventTitle}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base line-clamp-2">
                      {group.eventTitle}
                    </h3>

                    {group.eventEndDate && (
                      <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3" />
                        Ends{" "}
                        {format(new Date(group.eventEndDate), "MMM d, yyyy")}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Positions */}
              <div className="px-6 py-6 space-y-5">
                {group.positions.map((position, idx) => {
                  const pnl = calculatePnL(position);
                  const isProfitable = pnl.value >= 0;

                  return (
                    <div key={position.id}>
                      {idx > 0 && <Separator className="mb-5" />}

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        {/* Left */}
                        <div>
                          <p className="font-medium line-clamp-1">
                            {position.marketTitle}
                          </p>

                          <div className="flex items-center gap-3 mt-2">
                            <Badge
                              className={
                                position.side === "Yes"
                                  ? "bg-success/15 text-success"
                                  : "bg-danger/15 text-danger"
                              }
                            >
                              {position.side}
                            </Badge>

                            <span className="text-sm text-muted-foreground tabular-nums">
                              {position.quantity.toFixed(2)} shares @ $
                              {position.avgPrice.toFixed(4)}
                            </span>
                          </div>
                        </div>

                        {/* Right financial stats */}
                        <div className="flex items-center gap-8">
                          <div className="text-right tabular-nums">
                            <p className="text-sm text-muted-foreground">
                              Invested
                            </p>
                            <p className="font-semibold">
                              ${position.totalInvested.toFixed(2)}
                            </p>
                          </div>

                          <div className="text-right tabular-nums">
                            <p className="text-sm text-muted-foreground">
                              Current
                            </p>
                            <p className="font-semibold">
                              ${position.currentPrice?.toFixed(4)}
                            </p>
                          </div>

                          <div className="text-right min-w-30 tabular-nums">
                            <p className="text-sm text-muted-foreground">
                              P&amp;L
                            </p>
                            <p
                              className={`font-semibold flex items-center justify-end gap-1 ${
                                isProfitable ? "text-success" : "text-danger"
                              }`}
                            >
                              {isProfitable ? (
                                <TrendingUp className="w-4 h-4" />
                              ) : (
                                <TrendingDown className="w-4 h-4" />
                              )}
                              {isProfitable ? "+" : ""}${pnl.value.toFixed(2)}
                              <span className="text-xs opacity-70">
                                ({isProfitable ? "+" : ""}
                                {pnl.percentage.toFixed(1)}
                                %)
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
