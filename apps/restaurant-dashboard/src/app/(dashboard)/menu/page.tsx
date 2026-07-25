"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useRestaurantStore } from "@/store/restaurant-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  X,
  Pizza,
  BookOpen,
  UtensilsCrossed,
} from "lucide-react";

interface FoodCategory {
  id: string;
  restaurantId: string;
  name: string;
}

interface Food {
  id: string;
  restaurantId: string;
  categoryId: string | null;
  name: string;
  description: string | null;
  imageUrl: string | null;
  price: number;
  isAvailable: boolean;
  globalFoodId: string | null;
}

interface RestaurantFoods {
  foods: Food[];
  categories: FoodCategory[];
}

interface GlobalFood {
  id: string;
  categoryId: string | null;
  name: string;
  description: string | null;
  imageUrl: string | null;
  isAvailable: boolean;
}

interface GlobalCategory {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
}

function Dialog({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-xl bg-card p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-card-foreground">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-muted-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function MenuPage() {
  const { selectedRestaurant } = useRestaurantStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"catalog" | "custom">("custom");

  const [categoryDialog, setCategoryDialog] = useState<{ mode: "create" | "edit"; id?: string; name?: string } | null>(null);
  const [foodDialog, setFoodDialog] = useState<{
    mode: "create" | "edit";
    food?: Food;
    categoryId?: string;
  } | null>(null);
  const [addFromCatalog, setAddFromCatalog] = useState<GlobalFood | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "category" | "food"; id: string; name: string } | null>(null);

  const { data, isLoading } = useQuery<RestaurantFoods>({
    queryKey: ["restaurant-foods", selectedRestaurant?.id],
    queryFn: async () => {
      const res = await apiClient.get(`/foods/restaurant/${selectedRestaurant!.id}`);
      return res.data.data;
    },
    enabled: !!selectedRestaurant,
  });

  const { data: catalogData, isLoading: catalogLoading, error: catalogError, refetch: refetchCatalog } = useQuery<{ success: boolean; data: GlobalFood[] }>({
    queryKey: ["global-catalog", selectedRestaurant?.id],
    queryFn: async () => {
      const res = await apiClient.get(`/foods/global-catalog?restaurantId=${selectedRestaurant!.id}&_t=${Date.now()}`);
      return res.data;
    },
    enabled: !!selectedRestaurant,
  });

  const { data: globalCatsData, error: globalCatsError, refetch: refetchGlobalCats } = useQuery<{ success: boolean; data: GlobalCategory[] }>({
    queryKey: ["global-categories-list"],
    queryFn: async () => {
      const res = await apiClient.get(`/admin/global-foods/categories?_t=${Date.now()}`);
      return res.data;
    },
    retry: 1,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["restaurant-foods", selectedRestaurant?.id] });

  const createCategoryMut = useMutation({
    mutationFn: async (name: string) => {
      await apiClient.post(`/foods/restaurant/${selectedRestaurant!.id}/category`, { name });
    },
    onSuccess: () => { invalidate(); toast.success("Category created"); setCategoryDialog(null); },
    onError: (err: any) => { toast.error(err.response?.data?.error?.message ?? "Failed to create category"); },
  });

  const updateCategoryMut = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      await apiClient.patch(`/foods/category/${id}/restaurant/${selectedRestaurant!.id}`, { name });
    },
    onSuccess: () => { invalidate(); toast.success("Category updated"); setCategoryDialog(null); },
    onError: (err: any) => { toast.error(err.response?.data?.error?.message ?? "Failed to update category"); },
  });

  const deleteCategoryMut = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/foods/category/${id}/restaurant/${selectedRestaurant!.id}`);
    },
    onSuccess: () => { invalidate(); toast.success("Category deleted"); setDeleteTarget(null); },
    onError: (err: any) => { toast.error(err.response?.data?.error?.message ?? "Failed to delete category"); },
  });

  const updateFoodMut = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      await apiClient.patch(`/foods/${id}/restaurant/${selectedRestaurant!.id}`, data);
    },
    onSuccess: () => { invalidate(); toast.success("Food item updated"); setFoodDialog(null); },
    onError: (err: any) => { toast.error(err.response?.data?.error?.message ?? "Failed to update food item"); },
  });

  const deleteFoodMut = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/foods/${id}/restaurant/${selectedRestaurant!.id}`);
    },
    onSuccess: () => { invalidate(); toast.success("Food item deleted"); setDeleteTarget(null); },
    onError: (err: any) => { toast.error(err.response?.data?.error?.message ?? "Failed to delete food item"); },
  });

  const toggleAvailabilityMut = useMutation({
    mutationFn: async ({ id, isAvailable }: { id: string; isAvailable: boolean }) => {
      await apiClient.patch(`/foods/${id}/restaurant/${selectedRestaurant!.id}`, { isAvailable });
    },
    onSuccess: () => { invalidate(); toast.success("Availability updated"); },
    onError: (err: any) => { toast.error(err.response?.data?.error?.message ?? "Failed to update availability"); },
  });

  const addFromCatalogMut = useMutation({
    mutationFn: async (data: { globalFoodId: string; price: number; categoryId: string; name?: string; description?: string; imageUrl?: string }) => {
      await apiClient.post(`/foods/from-catalog/${selectedRestaurant!.id}`, data);
    },
    onSuccess: () => { invalidate(); setAddFromCatalog(null); toast.success("Item added to menu"); queryClient.invalidateQueries({ queryKey: ["global-catalog"] }); },
    onError: (err: any) => { toast.error(err.response?.data?.error?.message ?? "Failed to add item"); },
  });

  if (!selectedRestaurant) {
    return <EmptyState title="No restaurant selected" description="Select a restaurant from the sidebar to get started." />;
  }

  const allFoods = data?.foods ?? [];
  const categories = data?.categories ?? [];
  const uncategorized = allFoods.filter((f) => !f.categoryId);
  const catalog = catalogData?.data ?? [];
  const globalCats = globalCatsData?.data ?? [];

  const tabs = [
    { key: "catalog" as const, label: "From Catalog", icon: BookOpen },
    { key: "custom" as const, label: "My Menu", icon: UtensilsCrossed },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-card-foreground">Menu</h1>
          <div className="flex items-center gap-1 rounded-lg border bg-card p-0.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    activeTab === tab.key
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-card-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
        {activeTab === "custom" && (
          <Button onClick={() => setCategoryDialog({ mode: "create" })}>
            <Plus className="mr-1 h-4 w-4" /> Add Category
          </Button>
        )}
      </div>

      {/* === From Catalog Tab === */}
      {activeTab === "catalog" && (
        <>
          {catalogLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-lg border p-4">
                  <Skeleton className="mb-3 h-6 w-40" />
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : catalogError ? (
            <EmptyState
              title="Failed to load catalog"
              description={catalogError instanceof Error ? catalogError.message : "An error occurred while loading the catalog."}
              action={<Button onClick={() => refetchCatalog()} variant="outline" size="sm">Retry</Button>}
            />
          ) : catalog.length === 0 ? (
            <EmptyState
              title="Catalog is empty"
              description="No global food items available yet. Check back when the admin adds items to the catalog."
            />
          ) : (
            <div className="space-y-6">
              {globalCats.map((gc) => {
                const catItems = catalog.filter((f) => f.categoryId === gc.id);
                if (catItems.length === 0) return null;
                return (
                  <div key={gc.id} className="rounded-lg border bg-card">
                    <div className="border-b px-4 py-3">
                      <h3 className="font-semibold text-card-foreground">{gc.name}</h3>
                      {gc.description && (
                        <p className="mt-0.5 text-xs text-muted-foreground">{gc.description}</p>
                      )}
                    </div>
                    <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
                      {catItems.map((item) => (
                        <div key={item.id} className="flex gap-3 rounded-lg border p-3">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="h-16 w-16 shrink-0 rounded-md object-cover" />
                          ) : (
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-muted">
                              <Pizza className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-card-foreground">{item.name}</p>
                            {item.description && (
                              <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                            )}
                          </div>
                          <div className="flex items-start">
                            <Button
                              size="sm"
                              onClick={() => setAddFromCatalog(item)}
                            >
                              <Plus className="mr-1 h-3 w-3" /> Add
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {(() => {
                const uncategorizedItems = globalCatsError
                  ? catalog
                  : catalog.filter((f) => !f.categoryId);
                if (uncategorizedItems.length === 0) return null;
                return (
                  <div className="rounded-lg border bg-card">
                    <div className="border-b px-4 py-3">
                      <h3 className="font-semibold text-card-foreground">
                        {globalCatsError ? "All Items" : "Uncategorized"}
                      </h3>
                    </div>
                    <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
                      {uncategorizedItems.map((item) => (
                        <div key={item.id} className="flex gap-3 rounded-lg border p-3">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="h-16 w-16 shrink-0 rounded-md object-cover" />
                          ) : (
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-muted">
                              <Pizza className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-card-foreground">{item.name}</p>
                            {item.description && (
                              <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                            )}
                          </div>
                          <div className="flex items-start">
                            <Button size="sm" onClick={() => setAddFromCatalog(item)}>
                              <Plus className="mr-1 h-3 w-3" /> Add
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </>
      )}

      {/* === Custom Items Tab === */}
      {activeTab === "custom" && (
        <>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-lg border p-4">
                  <Skeleton className="mb-3 h-6 w-40" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          ) : categories.length === 0 && allFoods.length === 0 ? (
            <EmptyState
              title="No menu items yet"
              description="Add a category to get started, or browse the global catalog to add items."
            />
          ) : (
            <div className="space-y-6">
              {categories.map((cat) => {
                const catFoods = allFoods.filter((f) => f.categoryId === cat.id);
                return (
                  <div key={cat.id} className="rounded-lg border bg-card">
                    <div className="flex items-center justify-between border-b px-4 py-3">
                      <h3 className="font-semibold text-card-foreground">{cat.name}</h3>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCategoryDialog({ mode: "edit", id: cat.id, name: cat.name })}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTarget({ type: "category", id: cat.id, name: cat.name })}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    {catFoods.length === 0 ? (
                      <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                        No items in this category yet.
                      </p>
                    ) : (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b text-left text-muted-foreground">
                            <th className="px-4 py-2 font-medium">Name</th>
                            <th className="px-4 py-2 font-medium">Price</th>
                            <th className="px-4 py-2 font-medium">Status</th>
                            <th className="px-4 py-2 font-medium text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {catFoods.map((food) => (
                            <tr key={food.id} className="border-b last:border-b-0">
                              <td className="px-4 py-2.5">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-card-foreground">{food.name}</p>
                                  {food.globalFoodId && (
                                    <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300">catalog</span>
                                  )}
                                </div>
                                {food.description && (
                                  <p className="mt-0.5 text-xs text-muted-foreground">{food.description}</p>
                                )}
                              </td>
                              <td className="px-4 py-2.5 font-medium">${Number(food.price).toFixed(2)}</td>
                              <td className="px-4 py-2.5">
                                <Badge variant={food.isAvailable ? "success" : "secondary"}>
                                  {food.isAvailable ? "Available" : "Unavailable"}
                                </Badge>
                              </td>
                              <td className="px-4 py-2.5 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      toggleAvailabilityMut.mutate({
                                        id: food.id,
                                        isAvailable: !food.isAvailable,
                                      })
                                    }
                                  >
                                    {food.isAvailable ? (
                                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                      <Eye className="h-4 w-4 text-green-600" />
                                    )}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setFoodDialog({ mode: "edit", food })}
                                  >
                                    <Edit3 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      setDeleteTarget({ type: "food", id: food.id, name: food.name })
                                    }
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                );
              })}

              {uncategorized.length > 0 && (
                <div className="rounded-lg border bg-card">
                  <div className="border-b px-4 py-3">
                    <h3 className="font-semibold text-card-foreground">Uncategorized</h3>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="px-4 py-2 font-medium">Name</th>
                        <th className="px-4 py-2 font-medium">Price</th>
                        <th className="px-4 py-2 font-medium">Status</th>
                        <th className="px-4 py-2 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {uncategorized.map((food) => (
                        <tr key={food.id} className="border-b last:border-b-0">
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-card-foreground">{food.name}</p>
                              {food.globalFoodId && (
                                <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300">catalog</span>
                              )}
                            </div>
                            {food.description && (
                              <p className="mt-0.5 text-xs text-muted-foreground">{food.description}</p>
                            )}
                          </td>
                          <td className="px-4 py-2.5 font-medium">${Number(food.price).toFixed(2)}</td>
                          <td className="px-4 py-2.5">
                            <Badge variant={food.isAvailable ? "success" : "secondary"}>
                              {food.isAvailable ? "Available" : "Unavailable"}
                            </Badge>
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="sm" onClick={() => toggleAvailabilityMut.mutate({ id: food.id, isAvailable: !food.isAvailable })}>
                                {food.isAvailable ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-green-600" />}
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => setFoodDialog({ mode: "edit", food })}>
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => setDeleteTarget({ type: "food", id: food.id, name: food.name })}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Add From Catalog Dialog */}
      <Dialog
        open={addFromCatalog !== null}
        onClose={() => setAddFromCatalog(null)}
        title="Add to Menu"
      >
        {addFromCatalog && (
          <AddFromCatalogForm
            globalFood={addFromCatalog}
            globalCategories={globalCats}
            onSubmit={(data) => addFromCatalogMut.mutate(data)}
            onCancel={() => setAddFromCatalog(null)}
            isLoading={addFromCatalogMut.isPending}
          />
        )}
      </Dialog>

      {/* Category Dialog */}
      <Dialog
        open={categoryDialog !== null}
        onClose={() => setCategoryDialog(null)}
        title={categoryDialog?.mode === "create" ? "Add Category" : "Edit Category"}
      >
        <CategoryForm
          initialName={categoryDialog?.name ?? ""}
          onSubmit={(name) => {
            if (categoryDialog?.mode === "create") {
              createCategoryMut.mutate(name);
            } else if (categoryDialog?.id) {
              updateCategoryMut.mutate({ id: categoryDialog.id, name });
            }
          }}
          onCancel={() => setCategoryDialog(null)}
          isLoading={createCategoryMut.isPending || updateCategoryMut.isPending}
        />
      </Dialog>

      {/* Food Dialog */}
      <Dialog
        open={foodDialog !== null}
        onClose={() => setFoodDialog(null)}
        title={foodDialog?.mode === "create" ? "Add Food Item" : "Edit Food Item"}
      >
        <FoodForm
          initial={foodDialog?.food ?? null}
          selectedCategoryId={foodDialog?.categoryId}
          categories={categories}
          onSubmit={(data) => {
            if (foodDialog?.food) {
              const { categoryId, ...rest } = data;
              updateFoodMut.mutate({ id: foodDialog.food.id, data: rest });
            }
          }}
          onCancel={() => setFoodDialog(null)}
          isLoading={updateFoodMut.isPending}
        />
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Confirm Delete"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-card-foreground">{deleteTarget?.name}</span>?
            {deleteTarget?.type === "category" && (
              <span className="block mt-1">Food items in this category will become uncategorized.</span>
            )}
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!deleteTarget) return;
                if (deleteTarget.type === "category") {
                  deleteCategoryMut.mutate(deleteTarget.id);
                } else {
                  deleteFoodMut.mutate(deleteTarget.id);
                }
              }}
              disabled={deleteCategoryMut.isPending || deleteFoodMut.isPending}
            >
              Delete
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

function AddFromCatalogForm({
  globalFood,
  globalCategories,
  onSubmit,
  onCancel,
  isLoading,
}: {
  globalFood: GlobalFood;
  globalCategories: GlobalCategory[];
  onSubmit: (data: { globalFoodId: string; price: number; categoryId: string; name?: string; description?: string; imageUrl?: string }) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [name, setName] = useState(globalFood.name);
  const [description, setDescription] = useState(globalFood.description ?? "");
  const [imageUrl, setImageUrl] = useState(globalFood.imageUrl ?? "");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          globalFoodId: globalFood.id,
          price: Number(price),
          categoryId,
          name: name.trim() || undefined,
          description: description.trim() || undefined,
          imageUrl: imageUrl.trim() || undefined,
        });
      }}
      className="space-y-4"
    >
      <div className="flex gap-3 rounded-lg bg-muted p-3">
        {globalFood.imageUrl ? (
          <img src={globalFood.imageUrl} alt={globalFood.name} className="h-16 w-16 shrink-0 rounded-md object-cover" />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-muted-foreground/20">
            <Pizza className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
        <div>
          <p className="font-medium text-card-foreground">{globalFood.name}</p>
          {globalFood.description && (
            <p className="text-xs text-muted-foreground mt-0.5">{globalFood.description}</p>
          )}
        </div>
      </div>
      <div>
        <Label htmlFor="afc-price">Your Price ($)</Label>
        <Input id="afc-price" type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="9.99" required />
      </div>
      <div>
        <Label htmlFor="afc-category">Category</Label>
        <Select id="afc-category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
          <option value="">Select category</option>
          {globalCategories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="afc-name">Name <span className="text-muted-foreground font-normal">(optional override)</span></Label>
        <Input id="afc-name" value={name} onChange={(e) => setName(e.target.value)} placeholder={globalFood.name} />
      </div>
      <div>
        <Label htmlFor="afc-desc">Description <span className="text-muted-foreground font-normal">(optional override)</span></Label>
        <Input id="afc-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={globalFood.description ?? ""} />
      </div>
      <div>
        <Label htmlFor="afc-image">Image URL <span className="text-muted-foreground font-normal">(optional override)</span></Label>
        <Input id="afc-image" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder={globalFood.imageUrl ?? "https://..."} />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isLoading || !price || !categoryId}>Add to Menu</Button>
      </div>
    </form>
  );
}

function CategoryForm({
  initialName,
  onSubmit,
  onCancel,
  isLoading,
}: {
  initialName: string;
  onSubmit: (name: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [name, setName] = useState(initialName);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (name.trim()) onSubmit(name.trim());
      }}
      className="space-y-4"
    >
      <div>
        <Label htmlFor="cat-name">Category Name</Label>
        <Input id="cat-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Appetizers" required />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isLoading || !name.trim()}>{initialName ? "Save" : "Create"}</Button>
      </div>
    </form>
  );
}

function FoodForm({
  initial,
  selectedCategoryId,
  categories,
  onSubmit,
  onCancel,
  isLoading,
}: {
  initial: Food | null;
  selectedCategoryId?: string;
  categories: FoodCategory[];
  onSubmit: (data: { name: string; price: number; categoryId: string; description?: string; imageUrl?: string }) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [price, setPrice] = useState(initial ? String(initial.price) : "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? selectedCategoryId ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ name: name.trim(), price: Number(price), categoryId, description: description.trim() || undefined });
      }}
      className="space-y-4"
    >
      <div>
        <Label htmlFor="food-name">Name</Label>
        <Input id="food-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Margherita Pizza" required />
      </div>
      <div>
        <Label htmlFor="food-price">Price ($)</Label>
        <Input id="food-price" type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="9.99" required />
      </div>
      <div>
        <Label htmlFor="food-category">Category</Label>
        <Select id="food-category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
          <option value="">Select category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="food-desc">Description (optional)</Label>
        <Input id="food-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A delicious cheese pizza" />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isLoading || !name.trim() || !price || !categoryId}>{initial ? "Save" : "Add"}</Button>
      </div>
    </form>
  );
}
