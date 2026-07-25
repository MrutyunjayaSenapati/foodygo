"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/ui/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Search } from "lucide-react";
import { UserDetailContent } from "@/components/users/user-detail-content";

interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  status: string;
  roles: string[];
  createdAt: string;
}

interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: { page: number; pageSize: number; total: number; totalPages: number };
}

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  INACTIVE: "bg-yellow-100 text-yellow-800",
  SUSPENDED: "bg-red-100 text-red-800",
};

const roleLabels: Record<string, string> = {
  CUSTOMER: "Customer",
  RESTAURANT_OWNER: "Restaurant",
  DELIVERY_PARTNER: "Partner",
  ADMIN: "Admin",
};

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const pageSize = 10;

  const params: Record<string, string | number> = { page, pageSize };
  if (search) params.search = search;
  if (statusFilter && statusFilter !== "ALL") params.status = statusFilter;

  const { data, isLoading } = useQuery<PaginatedResponse<User>>({
    queryKey: ["users", page, search, statusFilter],
    queryFn: async () => {
      const res = await apiClient.get("/users", { params });
      return res.data;
    },
  });

  const columns: Column<User>[] = [
    {
      key: "fullName",
      header: "Name",
      render: (u) => (
        <button
          className="font-medium text-blue-600 hover:underline"
          onClick={() => setSelectedUserId(u.id)}
        >
          {u.fullName}
        </button>
      ),
    },
    { key: "email", header: "Email", render: (u) => u.email },
    {
      key: "roles",
      header: "Role",
      render: (u) => {
        const role = u.roles?.[0];
        return <span className="text-sm text-slate-600">{role ? (roleLabels[role] ?? role) : "—"}</span>;
      },
    },
    {
      key: "status",
      header: "Status",
      render: (u) => (
        <Badge className={statusColors[u.status] ?? ""} variant="outline">
          {u.status}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: "Joined",
      render: (u) => new Date(u.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Users</h1>

      <div className="mb-4 flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="max-w-xs"
        />
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v ?? "ALL"); setPage(1); }}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="SUSPENDED">Suspended</SelectItem>
            <SelectItem value="BANNED">Banned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable<User>
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        page={page}
        pageSize={pageSize}
        total={data?.meta?.total ?? 0}
        onPageChange={setPage}
        keyExtractor={(u) => u.id}
      />

      <Sheet open={!!selectedUserId} onOpenChange={(open) => { if (!open) setSelectedUserId(null); }}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>User Details</SheetTitle>
          </SheetHeader>
          {selectedUserId && <UserDetailContent id={selectedUserId} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}
