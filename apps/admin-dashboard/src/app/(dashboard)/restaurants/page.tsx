"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Check, X, Search } from "lucide-react";
import { toast } from "sonner";

interface Restaurant {
  id: string;
  name: string;
  description: string | null;
  address: string;
  status: string;
  rating: string;
  createdAt: string;
}

interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: { page: number; pageSize: number; total: number; totalPages: number };
}

const statusStyles: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  DOCUMENT_VERIFICATION: "bg-blue-100 text-blue-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  SUSPENDED: "bg-gray-100 text-gray-800",
};

export default function RestaurantsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const pageSize = 10;

  const params: Record<string, string | number> = { page, pageSize };
  if (search) params.search = search;

  const { data, isLoading } = useQuery<PaginatedResponse<Restaurant>>({
    queryKey: ["restaurants", page, search],
    queryFn: async () => {
      const res = await apiClient.get("/restaurants/admin/all", { params });
      return res.data;
    },
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["restaurants"] });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiClient.patch(`/restaurants/${id}/status`, { status }),
    onSuccess: () => { invalidate(); toast.success("Status updated"); },
    onError: () => toast.error("Failed to update status"),
  });

  const columns: Column<Restaurant>[] = [
    {
      key: "name",
      header: "Name",
      render: (r) => (
        <button
          className="font-medium text-blue-600 hover:underline"
          onClick={() => router.push(`/restaurants/${r.id}`)}
        >
          {r.name}
        </button>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <Badge className={statusStyles[r.status] ?? ""} variant="outline">
          {r.status.replace("_", " ")}
        </Badge>
      ),
    },
    { key: "address", header: "Address", render: (r) => r.address },
    { key: "rating", header: "Rating", render: (r) => (Number(r.rating) > 0 ? Number(r.rating).toFixed(1) : "—") },
    {
      key: "actions",
      header: "",
      render: (r) =>
        r.status === "PENDING" || r.status === "DOCUMENT_VERIFICATION" ? (
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              className="text-green-600"
              onClick={(e) => { e.stopPropagation(); statusMutation.mutate({ id: r.id, status: "APPROVED" }); }}
            >
              <Check className="mr-1 h-3 w-3" /> Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-red-600"
              onClick={(e) => { e.stopPropagation(); statusMutation.mutate({ id: r.id, status: "REJECTED" }); }}
            >
              <X className="mr-1 h-3 w-3" /> Reject
            </Button>
          </div>
        ) : null,
    },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Restaurants</h1>

      <div className="mb-4 flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search restaurants..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="max-w-xs"
        />
      </div>

      <DataTable<Restaurant>
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        page={page}
        pageSize={pageSize}
        total={data?.meta?.total ?? 0}
        onPageChange={setPage}
        keyExtractor={(r) => r.id}
      />

    </div>
  );
}
