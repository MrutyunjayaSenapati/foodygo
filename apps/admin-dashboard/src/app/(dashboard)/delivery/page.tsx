"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable, type Column } from "@/components/ui/data-table";

interface Partner {
  id: string;
  fullName: string;
  email: string;
  vehicleType: string;
  licenseNumber: string;
  userStatus: string;
}

interface Assignment {
  id: string;
  orderId: string;
  status: string;
  partnerName: string;
  partnerVehicle: string;
  restaurantName: string;
  assignedAt: string;
  acceptedAt: string | null;
  completedAt: string | null;
}

interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: { page: number; pageSize: number; total: number; totalPages: number };
}

const statusStyles: Record<string, string> = {
  ASSIGNED: "bg-yellow-100 text-yellow-800",
  ACCEPTED: "bg-blue-100 text-blue-800",
  PICKED_UP: "bg-purple-100 text-purple-800",
  COMPLETED: "bg-green-100 text-green-800",
};

function PartnersTable() {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading } = useQuery<PaginatedResponse<Partner>>({
    queryKey: ["delivery-partners", page],
    queryFn: async () => {
      const res = await apiClient.get("/delivery/partners", { params: { page, pageSize } });
      return res.data;
    },
  });

  const columns: Column<Partner>[] = [
    { key: "fullName", header: "Name", render: (p) => <span className="font-medium">{p.fullName}</span> },
    { key: "email", header: "Email", render: (p) => p.email },
    { key: "vehicleType", header: "Vehicle", render: (p) => <Badge variant="outline">{p.vehicleType}</Badge> },
    { key: "licenseNumber", header: "License", render: (p) => p.licenseNumber },
    { key: "userStatus", header: "Status", render: (p) => <Badge variant={p.userStatus === "ACTIVE" ? "default" : "secondary"}>{p.userStatus}</Badge> },
  ];

  return (
    <DataTable<Partner>
      columns={columns}
      data={data?.data ?? []}
      isLoading={isLoading}
      page={page}
      pageSize={pageSize}
      total={data?.meta?.total ?? 0}
      onPageChange={setPage}
      keyExtractor={(p) => p.id}
    />
  );
}

function AssignmentsTable() {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading } = useQuery<PaginatedResponse<Assignment>>({
    queryKey: ["delivery-assignments", page],
    queryFn: async () => {
      const res = await apiClient.get("/delivery/assignments", { params: { page, pageSize } });
      return res.data;
    },
  });

  const columns: Column<Assignment>[] = [
    { key: "orderId", header: "Order ID", render: (a) => <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{a.orderId.slice(0, 8)}…</code> },
    { key: "restaurantName", header: "Restaurant", render: (a) => a.restaurantName },
    { key: "partnerName", header: "Partner", render: (a) => a.partnerName },
    { key: "partnerVehicle", header: "Vehicle", render: (a) => a.partnerVehicle },
    {
      key: "status",
      header: "Status",
      render: (a) => (
        <Badge className={statusStyles[a.status] ?? ""} variant="outline">
          {a.status.replace("_", " ")}
        </Badge>
      ),
    },
    { key: "assignedAt", header: "Assigned", render: (a) => new Date(a.assignedAt).toLocaleString() },
  ];

  return (
    <DataTable<Assignment>
      columns={columns}
      data={data?.data ?? []}
      isLoading={isLoading}
      page={page}
      pageSize={pageSize}
      total={data?.meta?.total ?? 0}
      onPageChange={setPage}
      keyExtractor={(a) => a.id}
    />
  );
}

export default function DeliveryPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Delivery</h1>
      <Tabs defaultValue="partners">
        <TabsList className="mb-4">
          <TabsTrigger value="partners">Partners</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
        </TabsList>
        <TabsContent value="partners"><PartnersTable /></TabsContent>
        <TabsContent value="assignments"><AssignmentsTable /></TabsContent>
      </Tabs>
    </div>
  );
}
