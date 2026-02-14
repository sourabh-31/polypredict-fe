import { useState, useEffect } from "react";
import { useWalletStore } from "@/store/walletStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  DollarSign,
  ArrowRight,
  Check,
  X,
} from "lucide-react";

const PRESET_AMOUNTS = [10, 25, 50, 100];

export const TradeModal = ({ open, onClose, event, market }) => {
  const balance = useWalletStore((s) => s.balance);
  const buyPosition = useWalletStore((s) => s.buyPosition);
  const [amount, setAmount] = useState(10);
  const [side, setSide] = useState<"Yes" | "No">("Yes");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (open && market) {
      setSide(market.selectedSide || "Yes");
      setAmount(10);
      setShowSuccess(false);
    }
  }, [open, market]);

  if (!event || !market) return null;

  // Parse prices
  let yesPrice = 0.5;
  let noPrice = 0.5;
  try {
    const prices = JSON.parse(market.outcomePrices || '["0.5", "0.5"]');
    yesPrice = parseFloat(prices[0]) || 0.5;
    noPrice = parseFloat(prices[1]) || 0.5;
  } catch {
    // Use defaults
  }

  const currentPrice = side === "Yes" ? yesPrice : noPrice;
  const shares = amount / currentPrice;
  const potentialReturn = shares; // Each share pays $1 if correct
  const potentialProfit = potentialReturn - amount;
  const roi = (potentialProfit / amount) * 100;

  const canAfford = amount <= balance;
  const isValidAmount = amount > 0;

  const handleTrade = async () => {
    if (!canAfford || !isValidAmount || isSubmitting) return;

    setIsSubmitting(true);

    // Simulate network delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 300));

    const result = buyPosition(event, market, side, currentPrice, amount);

    if (result.success) {
      setShowSuccess(true);
      toast.success(
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-500" />
          <span>
            Bought {shares.toFixed(2)} {side} shares for ${amount.toFixed(2)}
          </span>
        </div>,
      );

      // Close after showing success animation
      setTimeout(() => {
        onClose();
        setShowSuccess(false);
      }, 1500);
    } else {
      toast.error(result.error || "Trade failed");
    }

    setIsSubmitting(false);
  };

  const marketTitle = market.groupItemTitle || market.question || "Unknown";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="trade-modal">
        {showSuccess ? (
          // Success Animation
          <div className="py-12 text-center animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <Check className="w-10 h-10 text-emerald-500 animate-in zoom-in duration-200" />
            </div>
            <h3 className="text-xl font-bold text-emerald-500">
              Trade Successful!
            </h3>
            <p className="text-muted-foreground mt-2">
              {shares.toFixed(2)} shares added to your positions
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-lg">Place Trade</DialogTitle>
            </DialogHeader>

            <div className="space-y-6 pt-2">
              {/* Event & Market Info */}
              <div className="space-y-2">
                <p className="font-medium line-clamp-2">{event.title}</p>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {marketTitle}
                </p>
              </div>

              <Separator />

              {/* Side Selection */}
              <div className="space-y-2">
                <Label>Your Prediction</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={side === "Yes" ? "default" : "outline"}
                    onClick={() => setSide("Yes")}
                    className={`h-16 flex-col gap-1 transition-all ${
                      side === "Yes"
                        ? "bg-emerald-500 hover:bg-emerald-600 border-emerald-500"
                        : "border-emerald-500/30 hover:border-emerald-500"
                    }`}
                    data-testid="select-yes"
                  >
                    <TrendingUp
                      className={`w-5 h-5 ${side === "Yes" ? "text-white" : "text-emerald-500"}`}
                    />
                    <span
                      className={
                        side === "Yes" ? "text-white" : "text-emerald-500"
                      }
                    >
                      Yes • {(yesPrice * 100).toFixed(0)}¢
                    </span>
                  </Button>
                  <Button
                    variant={side === "No" ? "default" : "outline"}
                    onClick={() => setSide("No")}
                    className={`h-16 flex-col gap-1 transition-all ${
                      side === "No"
                        ? "bg-red-500 hover:bg-red-600 border-red-500"
                        : "border-red-500/30 hover:border-red-500"
                    }`}
                    data-testid="select-no"
                  >
                    <TrendingDown
                      className={`w-5 h-5 ${side === "No" ? "text-white" : "text-red-500"}`}
                    />
                    <span
                      className={side === "No" ? "text-white" : "text-red-500"}
                    >
                      No • {(noPrice * 100).toFixed(0)}¢
                    </span>
                  </Button>
                </div>
              </div>

              {/* Amount Selection */}
              <div className="space-y-3">
                <Label>Amount</Label>
                <div className="flex gap-2">
                  {PRESET_AMOUNTS.map((preset) => (
                    <Button
                      key={preset}
                      variant={amount === preset ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => setAmount(preset)}
                      className="flex-1"
                      data-testid={`amount-${preset}`}
                    >
                      ${preset}
                    </Button>
                  ))}
                </div>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="number"
                    min="1"
                    max={balance}
                    value={amount}
                    onChange={(e) =>
                      setAmount(Math.max(0, parseFloat(e.target.value) || 0))
                    }
                    className="pl-8"
                    data-testid="custom-amount-input"
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Wallet className="w-3.5 h-3.5" />
                    Balance
                  </span>
                  <span className={!canAfford ? "text-red-500" : ""}>
                    ${balance.toFixed(2)}
                  </span>
                </div>
              </div>

              <Separator />

              {/* Order Summary */}
              <div className="space-y-2 p-4 rounded-lg bg-muted/50">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Price per share</span>
                  <span>${currentPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shares</span>
                  <span>{shares.toFixed(2)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Potential payout
                  </span>
                  <span className="font-semibold text-emerald-500">
                    ${potentialReturn.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Potential profit
                  </span>
                  <span className="text-emerald-500">
                    +${potentialProfit.toFixed(2)} ({roi.toFixed(0)}%)
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleTrade}
                disabled={!canAfford || !isValidAmount || isSubmitting}
                className={`w-full h-12 font-semibold transition-all active:scale-95 ${
                  side === "Yes"
                    ? "bg-emerald-500 hover:bg-emerald-600"
                    : "bg-red-500 hover:bg-red-600"
                }`}
                data-testid="confirm-trade-button"
              >
                {isSubmitting ? (
                  <span className="animate-pulse">Processing...</span>
                ) : !canAfford ? (
                  "Insufficient Balance"
                ) : (
                  <>
                    Buy {side} for ${amount.toFixed(2)}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
