"use client";

import Image from "next/image";
import { Clock, BarChart3 } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Event, Market } from "@/types/api.type";
import { formatDate } from "date-fns";

interface EventCardProps {
  event: Event;
  onTradeClick: (event: Event, market: Market, side: "Yes" | "No") => void;
}

export default function EventCard({ event, onTradeClick }: EventCardProps) {
  // Handle missing or null values with defaults
  const markets = event.markets || [];

  const endDate = event.endDate ? new Date(event.endDate) : null;

  // Formats large number to be more readable (e.g. 1500 -> 1.5K, 2000000 -> 2M)
  const formatVolume = (vol: number) => {
    const num = parseFloat(vol as unknown as string) || 0;
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
    return `$${num.toFixed(0)}`;
  };

  return (
    <Card className="group bg-card border-border rounded-xl overflow-hidden flex flex-col">
      {/* Image Header */}
      <div className="relative h-40 w-full">
        <Image
          src={event.image}
          alt={event.title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw,
           (max-width: 1024px) 50vw,
           33vw"
          loading="eager"
        />

        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/50 to-black/10" />

        <div className="absolute inset-0 p-5 flex flex-col justify-end text-white space-y-2">
          <h3 className="text-lg font-semibold leading-tight">{event.title}</h3>

          <div className="flex items-center gap-4 text-sm text-white/80">
            <div className="flex items-center gap-1">
              <BarChart3 className="w-4 h-4" />
              <span>{formatVolume(event.volume)}</span>
            </div>

            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>
                {endDate ? formatDate(endDate, "MMM d, yyyy") : "No end date"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Market body wrapper */}
      <div className="relative">
        {/* Top Fade */}
        <div className="pointer-events-none absolute top-0 left-0 right-0 h-6 bg-linear-to-b from-card to-transparent z-10" />

        <CardContent className="flex flex-col gap-4 px-5 pt-4 pb-6 h-44 overflow-y-auto no-scrollbar">
          {markets.slice(0, 3).map((market) => {
            // Parse prices
            let yesPrice = 0.5;
            let noPrice = 0.5;
            try {
              const prices = JSON.parse(
                market.outcomePrices || '["0.5", "0.5"]',
              );
              yesPrice = parseFloat(prices[0]) || 0.5;
              noPrice = parseFloat(prices[1]) || 0.5;
            } catch {
              // Use defaults
            }

            // Get market title
            const marketTitle =
              market.groupItemTitle || market.question || "Unknown";

            return (
              <div key={market.id} className="space-y-3 mt-auto">
                <div className="text-[15px] font-medium">{marketTitle}</div>

                <div className="flex gap-3">
                  <Button
                    variant="success"
                    className="flex-1 rounded-md py-2.5 hover:scale-[1.02]"
                    onClick={() => onTradeClick(event, market, "Yes")}
                  >
                    Yes {(yesPrice * 100).toFixed(2)}¢
                  </Button>

                  <Button
                    variant="danger"
                    className="flex-1 rounded-md py-2.5 hover:scale-[1.02]"
                    onClick={() => onTradeClick(event, market, "No")}
                  >
                    No {(noPrice * 100).toFixed(2)}¢
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>

        {/* Bottom Fade */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-linear-to-t from-card to-transparent z-10" />
      </div>
    </Card>
  );
}
