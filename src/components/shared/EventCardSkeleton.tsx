import { Card, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export function EventCardSkeleton() {
  return (
    <Card className="bg-card border-border rounded-xl overflow-hidden flex flex-col shadow-none">
      {/* Image Header Skeleton */}
      <div className="relative h-40 w-full">
        <Skeleton className="absolute inset-0 rounded-none" />

        <div className="absolute inset-0 p-5 flex flex-col justify-end space-y-3">
          <Skeleton className="h-5 w-3/4" />

          <div className="flex gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>

      {/* Market Body */}
      <div className="relative">
        {/* Top Fade (optional, keeps structure identical) */}
        <div className="pointer-events-none absolute top-0 left-0 right-0 h-6 bg-linear-to-b from-card to-transparent z-10" />

        <CardContent className="flex flex-col gap-4 px-5 pt-4 pb-6 h-44 overflow-hidden">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-4 w-4/5" />

              <div className="flex gap-3">
                <Skeleton className="h-10 flex-1 rounded-md" />
                <Skeleton className="h-10 flex-1 rounded-md" />
              </div>
            </div>
          ))}
        </CardContent>

        {/* Bottom Fade */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-linear-to-t from-card to-transparent z-10" />
      </div>
    </Card>
  );
}
