"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useRestaurantStore } from "@/store/restaurant-store";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { CheckCircle, CookingPot, PackageCheck, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Order {
  id: string;
  grandTotal: string;
  status: string;
  createdAt: string;
  userId: string;
}

interface PaginatedMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface ApiPaginatedResponse<T> {
  data: T[];
  meta: PaginatedMeta;
}

const STATUS_TABS = [
  { label: "All", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Accepted", value: "RESTAURANT_ACCEPTED" },
  { label: "Preparing", value: "PREPARING" },
  { label: "Ready", value: "READY_FOR_PICKUP" },
  { label: "Completed", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
] as const;

const STATUS_STYLES: Record<string, "warning" | "info" | "success" | "destructive" | "secondary"> = {
  PENDING: "warning",
  RESTAURANT_ACCEPTED: "info",
  PREPARING: "info",
  READY_FOR_PICKUP: "success",
  PICKED_UP: "secondary",
  OUT_FOR_DELIVERY: "secondary",
  DELIVERED: "success",
  CANCELLED: "destructive",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  RESTAURANT_ACCEPTED: "Accepted",
  PREPARING: "Preparing",
  READY_FOR_PICKUP: "Ready for Pickup",
  PICKED_UP: "Picked Up",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const NEXT_ACTIONS: Record<string, { label: string; status: string; icon: typeof CheckCircle; variant?: "default" | "outline" | "secondary" | "ghost" | "destructive" }> = {
  PENDING: { label: "Accept", status: "RESTAURANT_ACCEPTED", icon: CheckCircle, variant: "default" },
  RESTAURANT_ACCEPTED: { label: "Start Preparing", status: "PREPARING", icon: CookingPot, variant: "secondary" },
  PREPARING: { label: "Mark Ready", status: "READY_FOR_PICKUP", icon: PackageCheck, variant: "default" },
};

export default function OrdersPage() {
  const { selectedRestaurant } = useRestaurantStore();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading } = useQuery<ApiPaginatedResponse<Order>>({
    queryKey: ["restaurant-orders", selectedRestaurant?.id, statusFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
      if (statusFilter) params.set("status", statusFilter);
      const res = await apiClient.get(`/orders/restaurant/${selectedRestaurant!.id}?${params}`);
      return res.data;
    },
    enabled: !!selectedRestaurant,
  });

  const orders = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta ? Math.ceil(meta.total / meta.pageSize) : 0;

  const updateMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      await apiClient.patch(`/orders/${orderId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurant-orders", selectedRestaurant?.id] });
      toast.success("Order status updated");
    },
    onError: () => {
      toast.error("Failed to update order status");
    },
  });

  if (!selectedRestaurant) {
    return <EmptyState title="No restaurant selected" description="Select a restaurant from the sidebar to get started." />;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-card-foreground">Orders</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => queryClient.invalidateQueries({ queryKey: ["restaurant-orders", selectedRestaurant?.id] })}
        >
          <RefreshCw className="mr-1 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="mb-4 flex gap-1 overflow-x-auto">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setStatusFilter(tab.value); setPage(1); }}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
              statusFilter === tab.value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      ) : !data || orders.length === 0 ? (
        <EmptyState title="No orders found" description={statusFilter ? `No orders with status "${statusFilter}"` : "No orders yet for this restaurant."} />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const action = NEXT_ACTIONS[order.status];
                const ActionIcon = action?.icon;

                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">
                      #{order.id.slice(0, 8)}
                    </TableCell>
                    <TableCell className="font-medium">
                      ${Number(order.grandTotal).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_STYLES[order.status] ?? "secondary"}>
                        {STATUS_LABELS[order.status] ?? order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {new Intl.DateTimeFormat("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      }).format(new Date(order.createdAt))}
                    </TableCell>
                    <TableCell className="text-right">
                      {action ? (
                        <Button
                          size="sm"
                          variant={action.variant}
                          onClick={() => updateMutation.mutateAsync({ orderId: order.id, status: action.status })}
                          disabled={updateMutation.isPending}
                        >
                          {ActionIcon && <ActionIcon className="mr-1 h-3.5 w-3.5" />}
                          {action.label}
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">--</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages} ({meta?.total ?? 0} total)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
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
