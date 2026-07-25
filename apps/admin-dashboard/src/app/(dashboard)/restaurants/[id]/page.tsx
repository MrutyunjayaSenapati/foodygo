"use client";

import { use, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/ui/data-table";
import {
  ArrowLeft,
  UtensilsCrossed,
  ShoppingCart,
  DollarSign,
  CalendarDays,
  Check,
  X,
  Eye,
} from "lucide-react";
import { toast } from "sonner";

interface RestaurantDetail {
  id: string;
  name: string;
  description: string | null;
  address: string;
  phone: string | null;
  email: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  latitude: string;
  longitude: string;
  rating: string;
  status: string;
  createdAt: string;
}

interface RestaurantDocument {
  id: string;
  documentType: string;
  documentUrl: string;
  verificationStatus: string;
  verifiedAt: string | null;
  remarks: string | null;
}

interface FoodItem {
  id: string;
  restaurantId: string;
  categoryId: string | null;
  name: string;
  description: string | null;
  imageUrl: string | null;
  price: string;
  isAvailable: boolean;
}

interface FoodCategory {
  id: string;
  name: string;
}

interface OrderItem {
  id: string;
  userId: string;
  grandTotal: string;
  status: string;
  createdAt: string;
}

interface RestaurantAnalytics {
  ordersToday: number;
  revenueToday: number;
  revenueThisMonth: number;
  popularFoods: Array<{ foodId: string; totalOrdered: number }>;
}

const statusStyles: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  DOCUMENT_VERIFICATION: "bg-blue-100 text-blue-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  SUSPENDED: "bg-gray-100 text-gray-800",
};

const orderStatusStyles: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  RESTAURANT_ACCEPTED: "bg-blue-100 text-blue-800",
  PREPARING: "bg-indigo-100 text-indigo-800",
  READY_FOR_PICKUP: "bg-purple-100 text-purple-800",
  PICKED_UP: "bg-pink-100 text-pink-800",
  OUT_FOR_DELIVERY: "bg-orange-100 text-orange-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const docStatusStyles: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  VERIFIED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};

function StatCard({
  icon: Icon,
  label,
  value,
  loading,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  loading: boolean;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          {loading ? (
            <div className="mt-1 h-5 w-20 animate-pulse rounded bg-muted" />
          ) : (
            <p className="text-xl font-bold">{value}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function RestaurantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const detailQuery = useQuery<{ success: boolean; data: RestaurantDetail }>({
    queryKey: ["restaurant-detail", id],
    queryFn: async () => {
      const res = await apiClient.get(`/restaurants/${id}`);
      return res.data;
    },
  });

  const menuQuery = useQuery<{
    success: boolean;
    data: { foods: FoodItem[]; categories: FoodCategory[] };
  }>({
    queryKey: ["restaurant-menu", id],
    queryFn: async () => {
      const res = await apiClient.get(`/foods/restaurant/${id}`);
      return res.data;
    },
  });

  const ordersQuery = useQuery<{ success: boolean; data: OrderItem[] }>({
    queryKey: ["restaurant-orders", id],
    queryFn: async () => {
      const res = await apiClient.get(`/orders/restaurant/${id}`);
      return res.data;
    },
  });

  const analyticsQuery = useQuery<{ success: boolean; data: RestaurantAnalytics }>({
    queryKey: ["restaurant-analytics", id],
    queryFn: async () => {
      const res = await apiClient.get(`/analytics/restaurant/${id}`);
      return res.data;
    },
  });

  const docsQuery = useQuery<{ success: boolean; data: RestaurantDocument[] }>({
    queryKey: ["restaurant-documents", id],
    queryFn: async () => {
      const res = await apiClient.get(`/restaurants/${id}/documents`);
      return res.data;
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ status }: { status: string }) =>
      apiClient.patch(`/restaurants/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurant-detail", id] });
      toast.success("Status updated");
    },
    onError: () => toast.error("Failed to update status"),
  });

  const verifyMutation = useMutation({
    mutationFn: ({
      documentId,
      verificationStatus,
      remarks,
    }: {
      documentId: string;
      verificationStatus: string;
      remarks?: string;
    }) =>
      apiClient.patch(`/restaurants/documents/${documentId}/verify`, {
        verificationStatus,
        remarks,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurant-documents", id] });
      toast.success("Document updated");
    },
    onError: () => toast.error("Verification failed"),
  });

  const r = detailQuery.data?.data;
  const menu = menuQuery.data?.data;
  const ordersRaw = ordersQuery.data?.data;
  const orders = useMemo(() => ordersRaw ?? [], [ordersRaw]);
  const analytics = analyticsQuery.data?.data;

  const foodsByCategory = useMemo(() => {
    if (!menu) return [];
    const categoryMap = new Map<string, FoodItem[]>();
    const uncategorized: FoodItem[] = [];
    for (const food of menu.foods) {
      if (food.categoryId) {
        const list = categoryMap.get(food.categoryId) ?? [];
        list.push(food);
        categoryMap.set(food.categoryId, list);
      } else {
        uncategorized.push(food);
      }
    }
    const result: { category: FoodCategory | null; foods: FoodItem[] }[] = [];
    for (const cat of menu.categories) {
      const foods = categoryMap.get(cat.id);
      if (foods) {
        result.push({ category: cat, foods });
      }
    }
    if (uncategorized.length > 0) {
      result.push({ category: null, foods: uncategorized });
    }
    return result;
  }, [menu]);

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 20),
    [orders],
  );

  const orderColumns: Column<OrderItem>[] = [
    { key: "id", header: "Order ID", render: (o) => o.id.slice(0, 8) + "..." },
    {
      key: "grandTotal",
      header: "Amount",
      render: (o) => `$${Number(o.grandTotal).toFixed(2)}`,
    },
    {
      key: "status",
      header: "Status",
      render: (o) => (
        <Badge
          className={orderStatusStyles[o.status] ?? ""}
          variant="outline"
        >
          {o.status.replace(/_/g, " ")}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: "Date",
      render: (o) => new Date(o.createdAt).toLocaleDateString(),
    },
  ];

  const isLoading = detailQuery.isLoading;

  if (isLoading && !r) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-48 animate-pulse rounded bg-muted" />
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <div className="h-10 w-24 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-5">
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-4 w-full animate-pulse rounded bg-muted" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!r) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Restaurant not found.
      </div>
    );
  }

  const showActions =
    r.status === "PENDING" || r.status === "DOCUMENT_VERIFICATION";

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.push("/restaurants")}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Restaurants / {r.name}
      </button>

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{r.name}</h1>
            <div className="mt-1 flex items-center gap-3">
              <Badge className={statusStyles[r.status] ?? ""} variant="outline">
                {r.status.replace(/_/g, " ")}
              </Badge>
              {Number(r.rating) > 0 && (
                <span className="text-sm text-muted-foreground">
                  {Number(r.rating).toFixed(1)} rating
                </span>
              )}
            </div>
          </div>
        </div>
        {showActions && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="text-green-600"
              onClick={() => statusMutation.mutate({ status: "APPROVED" })}
            >
              <Check className="mr-1 h-4 w-4" /> Approve
            </Button>
            <Button
              variant="outline"
              className="text-red-600"
              onClick={() => statusMutation.mutate({ status: "REJECTED" })}
            >
              <X className="mr-1 h-4 w-4" /> Reject
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={ShoppingCart}
          label="Total Orders"
          value={orders.length.toLocaleString()}
          loading={ordersQuery.isLoading}
        />
        <StatCard
          icon={DollarSign}
          label="Revenue Today"
          value={
            analytics ? `$${Number(analytics.revenueToday).toLocaleString()}` : "—"
          }
          loading={analyticsQuery.isLoading}
        />
        <StatCard
          icon={CalendarDays}
          label="Revenue This Month"
          value={
            analytics
              ? `$${Number(analytics.revenueThisMonth).toLocaleString()}`
              : "—"
          }
          loading={analyticsQuery.isLoading}
        />
        <StatCard
          icon={UtensilsCrossed}
          label="Menu Items"
          value={String(menu?.foods.length ?? 0)}
          loading={menuQuery.isLoading}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Restaurant Info</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Description
              </p>
              <p className="text-sm">{r.description ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Address
              </p>
              <p className="text-sm">{r.address}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Phone</p>
              <p className="text-sm">{r.phone ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Email</p>
              <p className="text-sm">{r.email ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Coordinates
              </p>
              <p className="text-sm">
                {r.latitude}, {r.longitude}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Created
              </p>
              <p className="text-sm">
                {new Date(r.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {analytics && analytics.popularFoods.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Popular Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {analytics.popularFoods.map((pf) => {
                const food = menu?.foods.find((f) => f.id === pf.foodId);
                return (
                  <Badge key={pf.foodId} variant="secondary">
                    {food?.name ?? pf.foodId.slice(0, 8)} ({pf.totalOrdered})
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {menu && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Menu</CardTitle>
            <span className="text-xs text-muted-foreground">
              {menu.foods.length} items
            </span>
          </CardHeader>
          <CardContent>
            {foodsByCategory.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No menu items yet.
              </p>
            ) : (
              <div className="space-y-4">
                {foodsByCategory.map((group, i) => (
                  <div key={i}>
                    <h4 className="mb-2 text-sm font-semibold text-muted-foreground">
                      {group.category?.name ?? "Uncategorized"}
                    </h4>
                    <div className="divide-y rounded-lg border">
                      {group.foods.map((food) => (
                        <div
                          key={food.id}
                          className="flex items-center justify-between px-4 py-2.5"
                        >
                          <div className="flex items-center gap-3">
                            <div>
                              <p className="text-sm font-medium">{food.name}</p>
                              {food.description && (
                                <p className="text-xs text-muted-foreground">
                                  {food.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium">
                              ${Number(food.price).toFixed(2)}
                            </span>
                            <Badge
                              variant="outline"
                              className={
                                food.isAvailable
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }
                            >
                              {food.isAvailable ? "Available" : "Unavailable"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Recent Orders ({orders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ordersQuery.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-10 w-full animate-pulse rounded bg-muted"
                />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <DataTable<OrderItem>
              columns={orderColumns}
              data={recentOrders}
              isLoading={false}
              page={1}
              pageSize={20}
              total={recentOrders.length}
              onPageChange={() => {}}
              keyExtractor={(o) => o.id}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Documents</CardTitle>
        </CardHeader>
        <CardContent>
          {docsQuery.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="h-16 animate-pulse rounded bg-muted"
                />
              ))}
            </div>
          ) : (docsQuery.data?.data ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No documents uploaded.
            </p>
          ) : (
            <div className="space-y-2">
              {docsQuery.data?.data.map((doc) => (
                <div key={doc.id} className="rounded-lg border p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">
                      {doc.documentType.replace(/_/g, " ")}
                    </span>
                    <Badge
                      className={docStatusStyles[doc.verificationStatus] ?? ""}
                      variant="outline"
                    >
                      {doc.verificationStatus}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={doc.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                    >
                      <Eye className="h-3 w-3" /> View document
                    </a>
                    {doc.verificationStatus === "PENDING" && (
                      <div className="ml-auto flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs text-green-600"
                          onClick={() =>
                            verifyMutation.mutate({
                              documentId: doc.id,
                              verificationStatus: "VERIFIED",
                            })
                          }
                        >
                          <Check className="mr-1 h-3 w-3" /> Verify
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs text-red-600"
                          onClick={() =>
                            verifyMutation.mutate({
                              documentId: doc.id,
                              verificationStatus: "REJECTED",
                            })
                          }
                        >
                          <X className="mr-1 h-3 w-3" /> Reject
                        </Button>
                      </div>
                    )}
                  </div>
                  {doc.remarks && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Note: {doc.remarks}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
