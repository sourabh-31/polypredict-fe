import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export function useEventBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ["event", slug],
    queryFn: () => apiFetch(`/events/slug/${slug}`),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  });
}
