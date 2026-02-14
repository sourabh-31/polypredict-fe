import { create } from "zustand";

const INITIAL_BALANCE = 1000;

type Position = {
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

type WalletState = {
  balance: number;
  positions: Position[];
  userId: string | null;

  initializeWallet: (userId: string | null) => void;
  buyPosition: (
    event: any,
    market: any,
    side: "Yes" | "No",
    price: number,
    amount: number,
  ) => { success: boolean; error?: string };
  updatePositionPrices: (marketPrices: any) => void;
  resetWallet: () => void;
  calculatePnL: (position: Position) => {
    value: number;
    percentage: number;
  };
  groupedPositions: () => any[];
};

export const useWalletStore = create<WalletState>((set, get) => ({
  balance: INITIAL_BALANCE,
  positions: [],
  userId: null,

  // 🔐 Storage Key Helper
  initializeWallet: (userId) => {
    const keyPrefix = userId ? `polypredict_${userId}_` : `polypredict_guest_`;

    const savedBalance = localStorage.getItem(keyPrefix + "balance");
    const savedPositions = localStorage.getItem(keyPrefix + "positions");

    set({
      userId,
      balance: savedBalance ? parseFloat(savedBalance) : INITIAL_BALANCE,
      positions: savedPositions ? JSON.parse(savedPositions) : [],
    });
  },

  buyPosition: (event, market, side, price, amount) => {
    const { balance, positions, userId } = get();

    if (amount > balance) {
      return { success: false, error: "Insufficient balance" };
    }

    const quantity = amount / price;

    const existingIndex = positions.findIndex(
      (p) => p.marketId === market.id && p.side === side,
    );

    let updatedPositions = [...positions];

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

    // persist
    const prefix = userId ? `polypredict_${userId}_` : `polypredict_guest_`;

    localStorage.setItem(prefix + "balance", newBalance.toString());
    localStorage.setItem(
      prefix + "positions",
      JSON.stringify(updatedPositions),
    );

    set({
      balance: newBalance,
      positions: updatedPositions,
    });

    return { success: true };
  },

  updatePositionPrices: (marketPrices) => {
    const { positions, userId, balance } = get();

    const updated = positions.map((pos) => {
      const currentPrice = marketPrices[pos.marketId];
      if (currentPrice) {
        const priceForSide =
          pos.side === "Yes" ? currentPrice.yes : currentPrice.no;

        return {
          ...pos,
          currentPrice: priceForSide,
          lastUpdated: new Date().toISOString(),
        };
      }
      return pos;
    });

    const prefix = userId ? `polypredict_${userId}_` : `polypredict_guest_`;

    localStorage.setItem(prefix + "positions", JSON.stringify(updated));

    set({ positions: updated });
  },

  resetWallet: () => {
    const { userId } = get();

    const prefix = userId ? `polypredict_${userId}_` : `polypredict_guest_`;

    localStorage.removeItem(prefix + "balance");
    localStorage.removeItem(prefix + "positions");

    set({
      balance: INITIAL_BALANCE,
      positions: [],
    });
  },

  calculatePnL: (position) => {
    if (!position.currentPrice) return { value: 0, percentage: 0 };

    const currentValue = position.quantity * position.currentPrice;
    const pnlValue = currentValue - position.totalInvested;
    const pnlPercentage = (pnlValue / position.totalInvested) * 100;

    return {
      value: pnlValue,
      percentage: pnlPercentage,
    };
  },

  groupedPositions: () => {
    const { positions } = get();

    const grouped = positions.reduce((acc: any, pos) => {
      if (!acc[pos.eventId]) {
        acc[pos.eventId] = {
          eventId: pos.eventId,
          eventTitle: pos.eventTitle,
          eventImage: pos.eventImage,
          eventEndDate: pos.eventEndDate,
          positions: [],
        };
      }
      acc[pos.eventId].positions.push(pos);
      return acc;
    }, {});

    return Object.values(grouped);
  },
}));
