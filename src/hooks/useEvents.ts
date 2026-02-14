import { useQuery } from "@tanstack/react-query";
import { EventsResponse } from "@/types/api.type";

export function useEvents() {
  return useQuery<EventsResponse>({
    queryKey: ["events"],
    queryFn: async () => {
      const res = await fetch("/api/events");

      if (!res.ok) {
        throw new Error("Failed to fetch");
      }

      return res.json();
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 3,
    refetchInterval: 60000, // Polling every 60 seconds for real-time updates
  });
}
