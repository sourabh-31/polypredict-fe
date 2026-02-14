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
    refetchOnMount: false,
    refetchOnReconnect: true,
    retry: 3,
    refetchInterval: 30000, // Polling every 30 seconds for real-time updates
  });
}
