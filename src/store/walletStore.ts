import { Event, Market } from "@/types/api.type";
import { create } from "zustand";

export const INITIAL_BALANCE = 1000;

export type Position = {
  id: string;
  eventId: string;
  eventTitle: string;
  eventImage?: string;
  eventEndDate?: string;
  marketId: string;
  marketTitle: string;
  side: "Yes" | "No";
  avgPrice: number;
  quantity: number;
  totalInvested: number;
  purchasePrice: number;
  timestamp: string;
  lastUpdated: string;
  currentPrice?: number;
};

type MarketPrice = {
  yes: number;
  no: number;
};

export type MarketPrices = Record<string, MarketPrice>;

type WalletState = {
  balance: number;
  positions: Position[];
  userId: string | null;

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
  },

  buyPosition: (event, market, side, price, amount) => {
    const { balance, positions, userId } = get();

    if (amount <= 0) {
      return { success: false, error: "Invalid amount" };
    }

    if (amount > balance) {
      return { success: false, error: "Insufficient balance" };
    }

    const quantity = amount / price;

    const existingIndex = positions.findIndex(
      (p) => p.marketId === market.id && p.side === side,
    );

    let updatedPositions: Position[] = [...positions];

    if (existingIndex >= 0) {
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
