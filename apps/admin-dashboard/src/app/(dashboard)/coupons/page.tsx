"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AxiosError } from "axios";

interface Coupon {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: string;
  expiryDate: string;
}

interface CouponForm {
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: string;
  expiryDate: string;
}

const emptyForm: CouponForm = { code: "", discountType: "PERCENTAGE", discountValue: "", expiryDate: "" };

function extractFieldErrors(error: unknown): Record<string, string> {
  const axiosError = error as AxiosError<{
    error?: { details?: Array<{ field: string; message: string }> };
  }>;
  const details = axiosError.response?.data?.error?.details;
  if (!details) return {};
  const map: Record<string, string> = {};
  for (const d of details) {
    if (!map[d.field]) map[d.field] = d.message;
  }
  return map;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-red-500">{message}</p>;
}

export default function CouponsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CouponForm>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);
  const pageSize = 10;

  const { data, isLoading } = useQuery<{ success: boolean; data: Coupon[]; meta: { page: number; pageSize: number; total: number; totalPages: number } }>({
    queryKey: ["coupons", page],
    queryFn: async () => {
      const res = await apiClient.get("/coupons", { params: { page, pageSize } });
      return res.data;
    },
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["coupons"] });

  const createMutation = useMutation({
    mutationFn: (body: CouponForm) => apiClient.post("/coupons", { ...body, discountValue: Number(body.discountValue), expiryDate: new Date(body.expiryDate).toISOString() }),
    onSuccess: () => { invalidate(); setDialogOpen(false); setForm(emptyForm); setFieldErrors({}); toast.success("Coupon created"); },
    onError: (error) => {
      const errors = extractFieldErrors(error);
      setFieldErrors(errors);
      if (Object.keys(errors).length === 0) toast.error(error instanceof AxiosError ? error.response?.data?.error?.message ?? "Failed to create coupon" : "Failed to create coupon");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (body: CouponForm) => apiClient.patch(`/coupons/${editingId}`, { ...body, discountValue: Number(body.discountValue), expiryDate: new Date(body.expiryDate).toISOString() }),
    onSuccess: () => { invalidate(); setDialogOpen(false); setEditingId(null); setForm(emptyForm); setFieldErrors({}); toast.success("Coupon updated"); },
    onError: (error) => {
      const errors = extractFieldErrors(error);
      setFieldErrors(errors);
      if (Object.keys(errors).length === 0) toast.error(error instanceof AxiosError ? error.response?.data?.error?.message ?? "Failed to update coupon" : "Failed to update coupon");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/coupons/${id}`),
    onSuccess: () => { invalidate(); toast.success("Coupon deleted"); },
  });

  const openCreate = useCallback(() => {
    setEditingId(null);
    setForm(emptyForm);
    setFieldErrors({});
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((coupon: Coupon) => {
    setEditingId(coupon.id);
    setForm({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      expiryDate: coupon.expiryDate.slice(0, 10),
    });
    setFieldErrors({});
    setDialogOpen(true);
  }, []);

  const updateField = useCallback(<K extends keyof CouponForm>(key: K, value: CouponForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});
    if (editingId) {
      updateMutation.mutate(form);
    } else {
      createMutation.mutate(form);
    }
  }

  const columns: Column<Coupon>[] = [
    { key: "code", header: "Code", render: (c) => <code className="rounded bg-muted px-2 py-0.5 font-mono text-sm">{c.code}</code> },
    {
      key: "discountType",
      header: "Type",
      render: (c) => (
        <Badge variant={c.discountType === "PERCENTAGE" ? "default" : "secondary"}>
          {c.discountType === "PERCENTAGE" ? "%" : "$"}
        </Badge>
      ),
    },
    {
      key: "discountValue",
      header: "Value",
      render: (c) => (c.discountType === "PERCENTAGE" ? `${c.discountValue}%` : `$${c.discountValue}`),
    },
    {
      key: "expiryDate",
      header: "Expires",
      render: (c) => new Date(c.expiryDate).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "",
      render: (c) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => openEdit(c)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(c)}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Coupons</h1>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> Add Coupon
        </Button>
      </div>

      <DataTable<Coupon>
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        page={page}
        pageSize={pageSize}
        total={data?.meta?.total ?? 0}
        onPageChange={setPage}
        keyExtractor={(c) => c.id}
      />

      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) setFieldErrors({}); setDialogOpen(open); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Coupon" : "Add Coupon"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Update the coupon details below." : "Fill in the details to create a new coupon."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Code</label>
              <Input
                value={form.code}
                onChange={(e) => updateField("code", e.target.value)}
                placeholder="e.g. SUMMER20"
                required
              />
              <FieldError message={fieldErrors.code} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Discount Type</label>
              <Select
                value={form.discountType}
                onValueChange={(v) => updateField("discountType", v as "PERCENTAGE" | "FIXED")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                  <SelectItem value="FIXED">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
              <FieldError message={fieldErrors.discountType} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Discount Value</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={form.discountValue}
                onChange={(e) => updateField("discountValue", e.target.value)}
                placeholder={form.discountType === "PERCENTAGE" ? "e.g. 20" : "e.g. 5.00"}
                required
              />
              <FieldError message={fieldErrors.discountValue} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Expiry Date</label>
              <Input
                type="date"
                value={form.expiryDate}
                onChange={(e) => updateField("expiryDate", e.target.value)}
                required
              />
              <FieldError message={fieldErrors.expiryDate} />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); setFieldErrors({}); }}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingId ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Coupon</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.code}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => { if (deleteTarget) deleteMutation.mutate(deleteTarget.id); }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
