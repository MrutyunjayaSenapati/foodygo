"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useRestaurantStore } from "@/store/restaurant-store";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Star, MessageSquare } from "lucide-react";

interface Review {
  id: string;
  userName: string;
  userAvatar: string | null;
  rating: number;
  comment: string | null;
  createdAt: string;
}

interface PaginatedReviews {
  data: Review[];
  total: number;
  page: number;
  pageSize: number;
}

export default function ReviewsPage() {
  const { selectedRestaurant } = useRestaurantStore();
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading } = useQuery<PaginatedReviews>({
    queryKey: ["restaurant-reviews", selectedRestaurant?.id, page],
    queryFn: async () => {
      const res = await apiClient.get(`/reviews/restaurant/${selectedRestaurant!.id}?page=${page}&pageSize=${pageSize}`);
      return res.data.data;
    },
    enabled: !!selectedRestaurant,
  });

  if (!selectedRestaurant) {
    return <EmptyState title="No restaurant selected" description="Select a restaurant from the sidebar to get started." />;
  }

  const totalPages = data ? Math.ceil(data.total / pageSize) : 0;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-card-foreground">Reviews</h1>
        {data && (
          <p className="text-sm text-muted-foreground">{data.total} review{data.total !== 1 ? "s" : ""}</p>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-4">
              <div className="mb-2 flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div>
                  <Skeleton className="mb-1 h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      ) : !data || data.data.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No reviews yet"
          description="Reviews from customers will appear here."
        />
      ) : (
        <>
          <div className="space-y-4">
            {data.data.map((review) => (
              <div key={review.id} className="rounded-lg border bg-card p-4">
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {review.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground">{review.userName}</p>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${
                              i < review.rating
                                ? "fill-amber-400 text-amber-400"
                                : "fill-slate-200 text-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Intl.DateTimeFormat("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }).format(new Date(review.createdAt))}
                  </p>
                </div>
                {review.comment && (
                  <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
                )}
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
