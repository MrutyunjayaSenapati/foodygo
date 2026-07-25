"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DataTable, type Column } from "@/components/ui/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface GlobalCategory {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
}

interface GlobalFood {
  id: string;
  categoryId: string | null;
  name: string;
  description: string | null;
  imageUrl: string | null;
  isAvailable: boolean;
}

export default function CatalogPage() {
  const queryClient = useQueryClient();

  const [catDialog, setCatDialog] = useState<{ mode: "create" | "edit"; data?: GlobalCategory } | null>(null);
  const [foodDialog, setFoodDialog] = useState<{ mode: "create" | "edit"; data?: GlobalFood } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "category" | "food"; id: string; name: string } | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [foodPage, setFoodPage] = useState(1);
  const pageSize = 10;

  const { data: categories, isLoading: catsLoading } = useQuery<{ success: boolean; data: GlobalCategory[] }>({
    queryKey: ["global-categories"],
    queryFn: async () => {
      const res = await apiClient.get("/admin/global-foods/categories");
      return res.data;
    },
  });

  const { data: foodsData, isLoading: foodsLoading } = useQuery<{ success: boolean; data: GlobalFood[] }>({
    queryKey: ["global-foods", categoryFilter],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (categoryFilter !== "all") params.categoryId = categoryFilter;
      const res = await apiClient.get("/admin/global-foods/foods", { params });
      return res.data;
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["global-categories"] });
    queryClient.invalidateQueries({ queryKey: ["global-foods"] });
  };

  const createCatMut = useMutation({
    mutationFn: (data: { name: string; description?: string; imageUrl?: string }) =>
      apiClient.post("/admin/global-foods/categories", data),
    onSuccess: () => { invalidate(); setCatDialog(null); toast.success("Category created"); },
    onError: (err: any) => toast.error(err.response?.data?.error?.message ?? "Failed to create category"),
  });

  const updateCatMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<GlobalCategory> }) =>
      apiClient.patch(`/admin/global-foods/categories/${id}`, data),
    onSuccess: () => { invalidate(); setCatDialog(null); toast.success("Category updated"); },
    onError: (err: any) => toast.error(err.response?.data?.error?.message ?? "Failed to update category"),
  });

  const deleteCatMut = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/global-foods/categories/${id}`),
    onSuccess: () => { invalidate(); setDeleteTarget(null); toast.success("Category deleted"); },
    onError: (err: any) => toast.error(err.response?.data?.error?.message ?? "Failed to delete category"),
  });

  const createFoodMut = useMutation({
    mutationFn: (data: { name: string; categoryId?: string; description?: string; imageUrl?: string }) =>
      apiClient.post("/admin/global-foods/foods", data),
    onSuccess: () => { invalidate(); setFoodDialog(null); toast.success("Food item created"); },
    onError: (err: any) => toast.error(err.response?.data?.error?.message ?? "Failed to create food item"),
  });

  const updateFoodMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<GlobalFood> }) =>
      apiClient.patch(`/admin/global-foods/foods/${id}`, data),
    onSuccess: () => { invalidate(); setFoodDialog(null); toast.success("Food item updated"); },
    onError: (err: any) => toast.error(err.response?.data?.error?.message ?? "Failed to update food item"),
  });

  const deleteFoodMut = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/global-foods/foods/${id}`),
    onSuccess: () => { invalidate(); setDeleteTarget(null); toast.success("Food item deleted"); },
    onError: (err: any) => toast.error(err.response?.data?.error?.message ?? "Failed to delete food item"),
  });

  const catList = categories?.data ?? [];
  const foods = foodsData?.data ?? [];

  const openCreateFood = useCallback(() => {
    setFoodDialog({ mode: "create" });
    setFoodPage(1);
  }, []);

  const foodColumns: Column<GlobalFood>[] = [
    { key: "name", header: "Name", render: (f) => <span className="font-medium">{f.name}</span> },
    {
      key: "category",
      header: "Category",
      render: (f) => {
        const cat = catList.find((c) => c.id === f.categoryId);
        return cat?.name ?? <span className="text-muted-foreground">None</span>;
      },
    },
    {
      key: "description",
      header: "Description",
      render: (f) => f.description ?? <span className="text-muted-foreground">—</span>,
    },
    {
      key: "image",
      header: "Image",
      render: (f) =>
        f.imageUrl ? (
          <img src={f.imageUrl} alt={f.name} className="h-10 w-10 rounded-md object-cover" />
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      render: (f) => (
        <Badge variant={f.isAvailable ? "default" : "secondary"}>
          {f.isAvailable ? "Available" : "Hidden"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (f) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => setFoodDialog({ mode: "edit", data: f })}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeleteTarget({ type: "food", id: f.id, name: f.name })}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-10">
      {/* === Categories Section === */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Categories</h2>
          <Button onClick={() => setCatDialog({ mode: "create" })}>
            <Plus className="mr-2 h-4 w-4" /> Add Category
          </Button>
        </div>

        {catsLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-lg border bg-muted" />
            ))}
          </div>
        ) : catList.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No categories yet. Create one to get started.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {catList.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between rounded-lg border bg-card px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-card-foreground truncate">{cat.name}</p>
                  {cat.description && (
                    <p className="mt-0.5 text-xs text-muted-foreground truncate">{cat.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 ml-3 shrink-0">
                  <Badge variant={cat.isActive ? "default" : "secondary"} className="mr-1">
                    {cat.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <Button variant="ghost" size="icon" onClick={() => setCatDialog({ mode: "edit", data: cat })}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteTarget({ type: "category", id: cat.id, name: cat.name })}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* === Foods Section === */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-slate-900">Global Foods</h2>
            <Select value={categoryFilter} onValueChange={(v) => { if (v) { setCategoryFilter(v); setFoodPage(1); } }}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {catList.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={openCreateFood}>
            <Plus className="mr-2 h-4 w-4" /> Add Food
          </Button>
        </div>

        <DataTable<GlobalFood>
          columns={foodColumns}
          data={foods}
          isLoading={foodsLoading}
          page={foodPage}
          pageSize={pageSize}
          total={foods.length}
          onPageChange={setFoodPage}
          keyExtractor={(f) => f.id}
          emptyTitle="No global foods"
          emptyDescription="Add food items to the global catalog."
        />
      </section>

      {/* Category Dialog */}
      <CategoryDialog
        mode={catDialog?.mode}
        initial={catDialog?.data}
        open={catDialog !== null}
        onClose={() => setCatDialog(null)}
        onSubmit={(data) => {
          if (catDialog?.mode === "create") {
            createCatMut.mutate(data);
          } else if (catDialog?.data) {
            updateCatMut.mutate({ id: catDialog.data.id, data });
          }
        }}
        isLoading={createCatMut.isPending || updateCatMut.isPending}
      />

      {/* Food Dialog */}
      <GlobalFoodDialog
        mode={foodDialog?.mode}
        initial={foodDialog?.data}
        categories={catList}
        open={foodDialog !== null}
        onClose={() => setFoodDialog(null)}
        onSubmit={(data) => {
          if (foodDialog?.mode === "create") {
            createFoodMut.mutate(data);
          } else if (foodDialog?.data) {
            updateFoodMut.mutate({ id: foodDialog.data.id, data });
          }
        }}
        isLoading={createFoodMut.isPending || updateFoodMut.isPending}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.type === "category" ? "Category" : "Food Item"}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
              {deleteTarget?.type === "food" && (
                <span className="block mt-1">Restaurants that added this item will keep their copies as custom items.</span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (!deleteTarget) return;
                if (deleteTarget.type === "category") deleteCatMut.mutate(deleteTarget.id);
                else deleteFoodMut.mutate(deleteTarget.id);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function CategoryDialog({
  mode,
  initial,
  open,
  onClose,
  onSubmit,
  isLoading,
}: {
  mode?: "create" | "edit";
  initial?: GlobalCategory;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description?: string; imageUrl?: string }) => void;
  isLoading: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add Category" : "Edit Category"}</DialogTitle>
          <DialogDescription>
            {mode === "create" ? "Create a new global category for food items." : "Update the category details."}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit({
              name: name.trim(),
              description: description.trim() || undefined,
              imageUrl: imageUrl.trim() || undefined,
            });
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Pizza" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Image URL</label>
            <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {mode === "create" ? "Create" : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function GlobalFoodDialog({
  mode,
  initial,
  categories,
  open,
  onClose,
  onSubmit,
  isLoading,
}: {
  mode?: "create" | "edit";
  initial?: GlobalFood;
  categories: GlobalCategory[];
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; categoryId?: string; description?: string; imageUrl?: string }) => void;
  isLoading: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add Food Item" : "Edit Food Item"}</DialogTitle>
          <DialogDescription>
            {mode === "create" ? "Add a new item to the global food catalog." : "Update the food item details."}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit({
              name: name.trim(),
              categoryId: categoryId || undefined,
              description: description.trim() || undefined,
              imageUrl: imageUrl.trim() || undefined,
            });
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Margherita Pizza" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <Select value={categoryId} onValueChange={(v) => { if (v) setCategoryId(v); }}>
              <SelectTrigger>
                <SelectValue placeholder="None (uncategorized)" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A delicious cheese pizza" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Image URL</label>
            <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
            {imageUrl && (
              <img src={imageUrl} alt="Preview" className="mt-2 h-20 w-20 rounded-md object-cover" />
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {mode === "create" ? "Create" : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
