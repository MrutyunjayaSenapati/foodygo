"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../lib/api";
import { Users, ShoppingBag, DollarSign, Store, Truck } from "lucide-react";

interface PlatformStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  activeRestaurants: number;
  activeDeliveryPartners: number;
}

const cards = [
  { label: "Total Users", key: "totalUsers" as const, icon: Users, color: "bg-blue-500" },
  { label: "Total Orders", key: "totalOrders" as const, icon: ShoppingBag, color: "bg-green-500" },
  { label: "Total Revenue", key: "totalRevenue" as const, icon: DollarSign, color: "bg-yellow-500", prefix: "$" },
  { label: "Active Restaurants", key: "activeRestaurants" as const, icon: Store, color: "bg-purple-500" },
  { label: "Active Drivers", key: "activeDeliveryPartners" as const, icon: Truck, color: "bg-orange-500" },
];

export default function OverviewPage() {
  const { data, isLoading } = useQuery<PlatformStats>({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const res = await apiClient.get("/analytics/admin");
      return res.data.data;
    },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Platform Overview</h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div key={card.key} className="rounded-lg border bg-white p-6 shadow-sm">
              {isLoading ? (
                <div className="space-y-3">
                  <div className="h-10 w-10 animate-pulse rounded bg-slate-200" />
                  <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
                  <div className="h-8 w-16 animate-pulse rounded bg-slate-200" />
                </div>
              ) : (
                <>
                  <div className={`mb-4 inline-flex rounded-lg ${card.color} p-2.5 text-white`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-medium text-slate-500">{card.label}</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {card.prefix ?? ""}{data?.[card.key]?.toLocaleString() ?? "0"}
                  </p>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
