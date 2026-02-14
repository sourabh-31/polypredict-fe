import { Event, Market } from "@/types/api.type";
import { create } from "zustand";

export const INITIAL_BALANCE = 1000;

/**
 * A single user position in a specific market & side.
 * Represents cumulative buys (averaged over time).
 */
export type Position = {
  id: string;

  // Event level info
  eventId: string;
  eventTitle: string;
  eventImage?: string;
  eventEndDate?: string;

  // Market level info
  marketId: string;
  marketTitle: string;

  // Trade info
  side: "Yes" | "No";
  avgPrice: number;
  quantity: number;
  totalInvested: number;
  purchasePrice: number; // initial buy price
  timestamp: string; // first purchase time
  lastUpdated: string;

  // Updated dynamically via live market prices
  currentPrice?: number;
};

type MarketPrice = {
  yes: number;
  no: number;
};

// Map of marketId -> { yes, no }
export type MarketPrices = Record<string, MarketPrice>;

type WalletState = {
  balance: number;
  positions: Position[];
  userId: string | null;

  // Hydration flag for client-side persistence
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;

  initializeWallet: (userId: string | null) => void;

  buyPosition: (
    event: Event,
    market: Market,
    side: "Yes" | "No",
    price: number,
    amount: number,
  ) => { success: boolean; error?: string };

  updatePositionPrices: (marketPrices: MarketPrices) => void;

  resetWallet: () => void;

  calculatePnL: (position: Position) => {
    value: number;
    percentage: number;
  };
};

export const useWalletStore = create<WalletState>((set, get) => ({
  balance: INITIAL_BALANCE,
  positions: [],
  userId: null,

  hasHydrated: false,
  setHasHydrated: (value) => set({ hasHydrated: value }),

  /**
   * Loads wallet data from localStorage based on user.
   * Guest and logged-in users are isolated using different prefixes.
   */
  initializeWallet: (userId) => {
    if (typeof window === "undefined") return;

    const keyPrefix = userId ? `polypredict_${userId}_` : `polypredict_guest_`;

    const savedBalance = localStorage.getItem(keyPrefix + "balance");
    const savedPositions = localStorage.getItem(keyPrefix + "positions");

    set({
      userId,
      balance: savedBalance ? parseFloat(savedBalance) : INITIAL_BALANCE,
      positions: savedPositions
        ? (JSON.parse(savedPositions) as Position[])
        : [],
    });

    set({ hasHydrated: true });
  },

  /**
   * Handles buying into a market.
   * - Deducts balance
   * - Either merges with existing position (avg price logic)
   * - Or creates a new one
   */
  buyPosition: (event, market, side, price, amount) => {
    const { balance, positions, userId } = get();

    if (amount <= 0) {
      return { success: false, error: "Invalid amount" };
    }

    if (amount > balance) {
      return { success: false, error: "Insufficient balance" };
    }

    // Quantity derived from amount / price
    const quantity = amount / price;

    // Check if user already has position in same market & side
    const existingIndex = positions.findIndex(
      (p) => p.marketId === market.id && p.side === side,
    );

    let updatedPositions: Position[] = [...positions];

    if (existingIndex >= 0) {
      // Merge into existing position (weighted average logic)
      const existing = updatedPositions[existingIndex];

      const totalQuantity = existing.quantity + quantity;
      const totalInvested = existing.totalInvested + amount;
      const avgPrice = totalInvested / totalQuantity;

      updatedPositions[existingIndex] = {
        ...existing,
        quantity: totalQuantity,
        totalInvested,
        avgPrice,
        lastUpdated: new Date().toISOString(),
      };
    } else {
      // Create completely new position
      updatedPositions.push({
        id: `pos_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        eventId: event.id,
        eventTitle: event.title,
        eventImage: event.image,
        eventEndDate: event.endDate,
        marketId: market.id,
        marketTitle: market.groupItemTitle || market.question,
        side,
        avgPrice: price,
        quantity,
        totalInvested: amount,
        purchasePrice: price,
        timestamp: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      });
    }

    const newBalance = balance - amount;

    // Persist changes based on user context
    const prefix = userId ? `polypredict_${userId}_` : `polypredict_guest_`;

    if (typeof window !== "undefined") {
      localStorage.setItem(prefix + "balance", newBalance.toString());
      localStorage.setItem(
        prefix + "positions",
        JSON.stringify(updatedPositions),
      );
    }

    set({
      balance: newBalance,
      positions: updatedPositions,
    });

    return { success: true };
  },

  /**
   * Updates current prices for all positions
   * Used for live PnL calculation.
   */
  updatePositionPrices: (marketPrices) => {
    const { positions, userId } = get();

    const updated: Position[] = positions.map((pos) => {
      const currentPrice = marketPrices[pos.marketId];

      if (!currentPrice) return pos;

      const priceForSide =
        pos.side === "Yes" ? currentPrice.yes : currentPrice.no;

      return {
        ...pos,
        currentPrice: priceForSide,
        lastUpdated: new Date().toISOString(),
      };
    });

    const prefix = userId ? `polypredict_${userId}_` : `polypredict_guest_`;

    if (typeof window !== "undefined") {
      localStorage.setItem(prefix + "positions", JSON.stringify(updated));
    }

    set({ positions: updated });
  },

  /**
   * Clears wallet and localStorage data for current user.
   */
  resetWallet: () => {
    const { userId } = get();

    const prefix = userId ? `polypredict_${userId}_` : `polypredict_guest_`;

    if (typeof window !== "undefined") {
      localStorage.removeItem(prefix + "balance");
      localStorage.removeItem(prefix + "positions");
    }

    set({
      balance: INITIAL_BALANCE,
      positions: [],
    });
  },

  /**
   * Calculates Profit/Loss for a given position.
   * Uses current live price (if available).
   */
  calculatePnL: (position) => {
    if (position.currentPrice === undefined) {
      return { value: 0, percentage: 0 };
    }

    const currentValue = position.quantity * position.currentPrice;
    const pnlValue = currentValue - position.totalInvested;

    const pnlPercentage =
      position.totalInvested > 0
        ? (pnlValue / position.totalInvested) * 100
        : 0;

    return {
      value: pnlValue,
      percentage: pnlPercentage,
    };
  },
}));
