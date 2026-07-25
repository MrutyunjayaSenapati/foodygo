"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useRestaurantStore } from "@/store/restaurant-store";
import { ShoppingBag, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

interface RestaurantAnalytics {
  ordersToday: number;
  revenueToday: number;
  revenueThisMonth: number;
  popularFoods: { foodId: string; totalOrdered: number }[];
}

export default function OverviewPage() {
  const { selectedRestaurant } = useRestaurantStore();

  const { data, isLoading } = useQuery<RestaurantAnalytics>({
    queryKey: ["restaurant-analytics", selectedRestaurant?.id],
    queryFn: async () => {
      const res = await apiClient.get(`/analytics/restaurant/${selectedRestaurant!.id}`);
      return res.data.data;
    },
    enabled: !!selectedRestaurant,
  });

  if (!selectedRestaurant) {
    return <EmptyState title="No restaurant selected" description="Select a restaurant from the sidebar to get started." />;
  }

  const cards = [
    {
      label: "Orders Today",
      value: data?.ordersToday,
      icon: ShoppingBag,
      color: "bg-blue-500",
    },
    {
      label: "Revenue Today",
      value: data?.revenueToday,
      icon: TrendingUp,
      color: "bg-green-500",
      prefix: "$",
    },
    {
      label: "Revenue This Month",
      value: data?.revenueThisMonth,
      icon: DollarSign,
      color: "bg-yellow-500",
      prefix: "$",
    },
    {
      label: "Popular Items",
      value: data?.popularFoods.length ?? 0,
      icon: TrendingDown,
      color: "bg-purple-500",
    },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-card-foreground">
        {selectedRestaurant.name}
      </h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.label}
                </CardTitle>
                <div className={`rounded-lg ${card.color} p-2 text-white`}>
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <p className="text-2xl font-bold">
                    {card.prefix ?? ""}
                    {card.value?.toLocaleString() ?? "0"}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
