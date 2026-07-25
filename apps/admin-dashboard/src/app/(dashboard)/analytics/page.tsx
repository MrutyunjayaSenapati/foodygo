"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TrendPoint {
  date: string;
  revenue?: number;
  count?: number;
}

interface TopRestaurant {
  restaurantId: string;
  name: string;
  logoUrl: string | null;
  totalOrders: number;
  totalRevenue: number;
}

const daysOptions = [7, 30, 90];

function ChartCard({ title, data, dataKey, color }: { title: string; data: TrendPoint[]; dataKey: string; color: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function TopRestaurantsCard() {
  const { data, isLoading } = useQuery<{ success: boolean; data: TopRestaurant[] }>({
    queryKey: ["top-restaurants"],
    queryFn: async () => {
      const res = await apiClient.get("/analytics/admin/top-restaurants", { params: { limit: 10 } });
      return res.data;
    },
  });

  const restaurants = data?.data ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Top Restaurants</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-6 animate-pulse rounded bg-muted" />
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <p className="text-sm text-muted-foreground">No data yet.</p>
        ) : (
          <div className="space-y-3">
            {restaurants.map((r, i) => (
              <div key={r.restaurantId} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">#{i + 1}</span>
                  <span className="text-sm font-medium">{r.name}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-muted-foreground">{r.totalOrders} orders</span>
                  <Badge variant="secondary">${Number(r.totalRevenue).toLocaleString()}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  const [days, setDays] = useState(7);

  const revenueQuery = useQuery<{ success: boolean; data: TrendPoint[] }>({
    queryKey: ["revenue-trend", days],
    queryFn: async () => {
      const res = await apiClient.get("/analytics/admin/revenue-trend", { params: { days } });
      return res.data;
    },
  });

  const orderQuery = useQuery<{ success: boolean; data: TrendPoint[] }>({
    queryKey: ["order-trend", days],
    queryFn: async () => {
      const res = await apiClient.get("/analytics/admin/order-trend", { params: { days } });
      return res.data;
    },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <div className="flex gap-1">
          {daysOptions.map((d) => (
            <Button
              key={d}
              variant={days === d ? "default" : "outline"}
              size="sm"
              onClick={() => setDays(d)}
            >
              {d}d
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Revenue Trend"
          data={revenueQuery.data?.data ?? []}
          dataKey="revenue"
          color="#6366f1"
        />
        <ChartCard
          title="Order Trend"
          data={orderQuery.data?.data ?? []}
          dataKey="count"
          color="#22c55e"
        />
      </div>

      <div className="mt-6">
        <TopRestaurantsCard />
      </div>
    </div>
  );
}
