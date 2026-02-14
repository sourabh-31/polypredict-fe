import { MarketPrices } from "@/store/walletStore";
import { Event } from "@/types/api.type";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function extractMarketPrices(events: Event[]): MarketPrices {
  const marketPrices: MarketPrices = {};

  events.forEach((event) => {
    event.markets?.forEach((market) => {
      try {
        const prices = JSON.parse(market.outcomePrices || "[]");

        marketPrices[market.id] = {
          yes: parseFloat(prices[0]) || 0,
          no: parseFloat(prices[1]) || 0,
        };
      } catch {
        // ignore invalid
      }
    });
  });

  return marketPrices;
}
