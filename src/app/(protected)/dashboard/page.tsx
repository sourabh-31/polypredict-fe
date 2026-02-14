"use client";

import EventCard from "@/components/shared/EventCard";
import { EventCardSkeleton } from "@/components/shared/EventCardSkeleton";
import { TradeModal } from "@/components/shared/TradeModal";
import { Button } from "@/components/ui/button";
import { useEvents } from "@/hooks/useEvents";
import { Event, Market, MarketWithSide } from "@/types/api.type";
import { RefreshCw, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [spinning, setSpinning] = useState(false);

  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState<MarketWithSide | null>(
    null,
  );
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Events hook
  const {
    data: eventsData,
    refetch: refetchEvents,
    isLoading: isLoadingEvents,
    isRefetching: isRefetchingEvents,
    isError,
  } = useEvents();

  // On buy button click
  const handleTradeClick = (
    event: Event,
    market: Market,
    side: "Yes" | "No",
  ) => {
    setSelectedEvent(event);
    setSelectedMarket({ ...market, selectedSide: side }); // Preselect the side in the modal based on the button clicked by the user
    setTradeModalOpen(true);
  };

  //On modal close
  const handleCloseModal = () => {
    setTradeModalOpen(false);
    setSelectedMarket(null);
    setSelectedEvent(null);
  };

  // Intentional delay for spinner animation to show properly on fast fetches and also to prevent multiple quick clicks by the user (debouncing)
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (isRefetchingEvents) {
      setSpinning(true);
    } else if (spinning) {
      timeout = setTimeout(() => {
        setSpinning(false);
      }, 600);
    }

    return () => clearTimeout(timeout);
  }, [isRefetchingEvents]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 xl:max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-primary" />
              Politics
            </h1>
            <p className="text-muted-foreground mt-1">
              Trade on political events with live Polymarket data
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={spinning}
            onClick={() => refetchEvents()}
            className="self-start sm:self-auto"
          >
            <RefreshCw
              className={`w-4 h-4 ${spinning ? "animate-spin" : ""}`}
            />

            {/* Hide text on mobile */}
            <span className="hidden sm:inline ml-2">Refresh</span>
          </Button>
        </div>

        {/* Events content */}
        <div className="mt-4">
          {isLoadingEvents ? (
            // Loading state skeletons - show 6 cards in a responsive grid
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <EventCardSkeleton key={i} />
              ))}
            </div>
          ) : isError ? (
            // Handling api level errors (like network issues, server errors, etc.) and also showing a user-friendly message with a retry button to refetch the data.
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-2xl font-medium">Something went wrong.</p>

              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchEvents()}
                className="mt-4"
              >
                Try Again
              </Button>
            </div>
          ) : !eventsData || eventsData.length === 0 ? (
            // If data fecthed is empty, show a message to the user instead of an empty screen
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-2xl font-medium">No events available</p>
              <p className="text-sm text-muted-foreground mt-2">
                Please check back later.
              </p>
            </div>
          ) : (
            // Event cards in a grid layout
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {eventsData.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onTradeClick={handleTradeClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Trade Modal */}
      <TradeModal
        open={tradeModalOpen}
        onClose={handleCloseModal}
        event={selectedEvent}
        market={selectedMarket}
      />
    </div>
  );
}
