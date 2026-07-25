"use client";

import { use, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/ui/data-table";
import Image from "next/image";
import {
  ArrowLeft,
  ShoppingCart,
  DollarSign,
  MapPin,
  CalendarDays,
  User,
} from "lucide-react";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  status: string;
  createdAt: string;
}

interface OrderItem {
  id: string;
  restaurantId: string;
  grandTotal: string;
  status: string;
  createdAt: string;
  restaurantName: string;
  restaurantLogo: string | null;
}

interface Address {
  id: string;
  label: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
}

interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: { page: number; pageSize: number; total: number; totalPages: number };
}

const statusStyles: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  INACTIVE: "bg-yellow-100 text-yellow-800",
  SUSPENDED: "bg-red-100 text-red-800",
  BANNED: "bg-gray-100 text-gray-800",
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

export default function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const profileQuery = useQuery<{ success: boolean; data: UserProfile }>({
    queryKey: ["user-profile", id],
    queryFn: async () => {
      const res = await apiClient.get(`/users/${id}`);
      return res.data;
    },
  });

  const [ordersPage, setOrdersPage] = useState(1);

  const ordersQuery = useQuery<PaginatedResponse<OrderItem>>({
    queryKey: ["user-orders", id, ordersPage],
    queryFn: async () => {
      const res = await apiClient.get(`/users/${id}/orders`, {
        params: { page: ordersPage, pageSize: 10 },
      });
      return res.data;
    },
  });

  const addressesQuery = useQuery<{ success: boolean; data: Address[] }>({
    queryKey: ["user-addresses", id],
    queryFn: async () => {
      const res = await apiClient.get(`/users/${id}/addresses`);
      return res.data;
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ status }: { status: string }) =>
      apiClient.patch(`/users/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile", id] });
      toast.success("Status updated");
    },
    onError: () => toast.error("Failed to update status"),
  });

  const profile = profileQuery.data?.data;
  const ordersRaw = ordersQuery.data?.data;
  const orders = useMemo(() => ordersRaw ?? [], [ordersRaw]);
  const addresses = addressesQuery.data?.data ?? [];
  const orderMeta = ordersQuery.data?.meta;
  const addressLoading = addressesQuery.isLoading;

  const totalSpend = useMemo(
    () =>
      orders.reduce(
        (sum, o) => sum + Number(o.grandTotal),
        0,
      ),
    [orders],
  );

  const orderColumns: Column<OrderItem>[] = [
    {
      key: "id",
      header: "Order ID",
      render: (o) => o.id.slice(0, 8) + "...",
    },
    {
      key: "restaurantName",
      header: "Restaurant",
      render: (o) => o.restaurantName,
    },
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

  const isLoading = profileQuery.isLoading;

  if (isLoading && !profile) {
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
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-4 w-full animate-pulse rounded bg-muted" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        User not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.push("/users")}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Users / {profile.fullName}
      </button>

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            {profile.avatarUrl ? (
              <Image
                src={profile.avatarUrl}
                alt=""
                width={56}
                height={56}
                className="h-14 w-14 rounded-full object-cover"
                unoptimized
              />
            ) : (
              <User className="h-6 w-6 text-primary" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {profile.fullName}
            </h1>
            <div className="mt-1 flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {profile.email}
              </span>
              <Badge
                className={statusStyles[profile.status] ?? ""}
                variant="outline"
              >
                {profile.status}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {profile.status === "ACTIVE" && (
            <Button
              variant="outline"
              className="text-red-600"
              onClick={() =>
                statusMutation.mutate({ status: "SUSPENDED" })
              }
            >
              Suspend
            </Button>
          )}
          {profile.status === "SUSPENDED" && (
            <>
              <Button
                variant="outline"
                className="text-green-600"
                onClick={() =>
                  statusMutation.mutate({ status: "ACTIVE" })
                }
              >
                Activate
              </Button>
              <Button
                variant="outline"
                className="text-red-600"
                onClick={() =>
                  statusMutation.mutate({ status: "BANNED" })
                }
              >
                Ban
              </Button>
            </>
          )}
          {profile.status === "BANNED" && (
            <Button
              variant="outline"
              className="text-green-600"
              onClick={() =>
                statusMutation.mutate({ status: "ACTIVE" })
              }
            >
              Activate
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={ShoppingCart}
          label="Total Orders"
          value={String(orderMeta?.total ?? 0)}
          loading={ordersQuery.isLoading}
        />
        <StatCard
          icon={DollarSign}
          label="Total Spend"
          value={`$${totalSpend.toFixed(2)}`}
          loading={ordersQuery.isLoading}
        />
        <StatCard
          icon={MapPin}
          label="Addresses"
          value={String(addresses.length)}
          loading={addressLoading}
        />
        <StatCard
          icon={CalendarDays}
          label="Member Since"
          value={new Date(profile.createdAt).toLocaleDateString()}
          loading={false}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile Info</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Full Name
              </p>
              <p className="text-sm">{profile.fullName}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Email
              </p>
              <p className="text-sm">{profile.email}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Status
              </p>
              <p className="text-sm">{profile.status}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Joined
              </p>
              <p className="text-sm">
                {new Date(profile.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-xs font-medium text-muted-foreground">
                User ID
              </p>
              <p className="text-sm font-mono">{profile.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Order History ({orderMeta?.total ?? 0})
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
          ) : orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No orders yet.
            </p>
          ) : (
            <DataTable<OrderItem>
              columns={orderColumns}
              data={orders}
              isLoading={false}
              page={ordersPage}
              pageSize={10}
              total={orderMeta?.total ?? 0}
              onPageChange={setOrdersPage}
              keyExtractor={(o) => o.id}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Saved Addresses ({addresses.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {addressLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="h-20 animate-pulse rounded bg-muted"
                />
              ))}
            </div>
          ) : addresses.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No addresses saved.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {addresses.map((addr) => (
                <div key={addr.id} className="rounded-lg border p-4">
                  <div className="mb-1 flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    {addr.label && (
                      <span className="text-xs font-semibold uppercase text-muted-foreground">
                        {addr.label}
                      </span>
                    )}
                  </div>
                  <p className="text-sm">{addr.addressLine1}</p>
                  {addr.addressLine2 && (
                    <p className="text-sm text-muted-foreground">
                      {addr.addressLine2}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {addr.city}, {addr.state} {addr.postalCode}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
