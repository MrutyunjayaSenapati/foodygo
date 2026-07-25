"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { useRestaurantStore } from "@/store/restaurant-store";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Store, ChevronRight, Plus, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface RestaurantOption {
  id: string;
  name: string;
  logoUrl: string | null;
  status: string;
}

interface CategoryEntry {
  name: string;
  items: FoodEntry[];
}

interface FoodEntry {
  name: string;
  price: string;
  description: string;
}

export default function SelectRestaurantPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { selectRestaurant } = useRestaurantStore();
  const [restaurants, setRestaurants] = useState<RestaurantOption[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const [categories, setCategories] = useState<CategoryEntry[]>([
    { name: "", items: [{ name: "", price: "", description: "" }] },
  ]);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiClient.get("/restaurants/my");
        setRestaurants(res.data.data ?? []);
      } catch {
        // handled by interceptor
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSelect = (r: RestaurantOption) => {
    selectRestaurant({ id: r.id, name: r.name, logoUrl: r.logoUrl });
    router.replace("/");
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setPhone("");
    setEmail("");
    setAddress("");
    setCategories([{ name: "", items: [{ name: "", price: "", description: "" }] }]);
    setStep(1);
    setShowForm(false);
  };

  const addCategory = () => {
    setCategories([...categories, { name: "", items: [{ name: "", price: "", description: "" }] }]);
  };

  const removeCategory = (idx: number) => {
    setCategories(categories.filter((_, i) => i !== idx));
  };

  const updateCategoryName = (idx: number, value: string) => {
    const updated = categories.map((c, i) => (i === idx ? { ...c, name: value } : c));
    setCategories(updated);
  };

  const addFoodItem = (catIdx: number) => {
    const updated = categories.map((c, i) =>
      i === catIdx ? { ...c, items: [...c.items, { name: "", price: "", description: "" }] } : c,
    );
    setCategories(updated);
  };

  const removeFoodItem = (catIdx: number, itemIdx: number) => {
    const updated = categories.map((c, i) =>
      i === catIdx ? { ...c, items: c.items.filter((_, j) => j !== itemIdx) } : c,
    );
    setCategories(updated);
  };

  const updateFoodItem = (catIdx: number, itemIdx: number, field: keyof FoodEntry, value: string) => {
    const updated = categories.map((c, i) =>
      i === catIdx
        ? {
            ...c,
            items: c.items.map((item, j) => (j === itemIdx ? { ...item, [field]: value } : item)),
          }
        : c,
    );
    setCategories(updated);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Restaurant name is required");
      return;
    }
    setSubmitting(true);

    try {
      const res = await apiClient.post("/restaurants", {
        name: name.trim(),
        description: description.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        address: address.trim() || undefined,
      });
      const newRestaurant = res.data.data;
      const restaurantId = newRestaurant.id;

      for (const cat of categories) {
        if (!cat.name.trim()) continue;
        const catRes = await apiClient.post(`/foods/restaurant/${restaurantId}/category`, {
          name: cat.name.trim(),
        });
        const categoryId = catRes.data.data.id;

        for (const item of cat.items) {
          if (!item.name.trim() || !item.price) continue;
          await apiClient.post(`/foods/restaurant/${restaurantId}`, {
            categoryId,
            name: item.name.trim(),
            description: item.description.trim() || undefined,
            price: Number(item.price),
          });
        }
      }

      toast.success("Restaurant created!");
      const updated = await apiClient.get("/restaurants/my");
      setRestaurants(updated.data.data ?? []);
      resetForm();
    } catch {
      toast.error("Failed to create restaurant");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md rounded-lg bg-card p-8 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mb-2 flex justify-center">
            <Store className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-card-foreground">Select Restaurant</h1>
          <p className="mt-1 text-sm text-muted-foreground">Choose which restaurant to manage</p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {restaurants.map((r) => (
              <button
                key={r.id}
                onClick={() => handleSelect(r)}
                className="flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:border-primary hover:bg-primary/5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background">
                  <Store className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-card-foreground">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.status}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        )}

        <Button className="mt-4 w-full" onClick={() => setShowForm(true)}>
          <Plus className="mr-1 h-4 w-4" />
          Add New Restaurant
        </Button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8">
          <div className="fixed inset-0 bg-black/50" onClick={resetForm} />
          <div className="relative z-50 w-full max-w-xl rounded-xl bg-card p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {step === 1 ? "Restaurant Details" : "Add Menu Items"}
              </h2>
              <button onClick={resetForm} className="rounded-md p-1 hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>

            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="res-name">Restaurant Name *</Label>
                  <Input
                    id="res-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="My Restaurant"
                  />
                </div>
                <div>
                  <Label htmlFor="res-desc">Description</Label>
                  <Input
                    id="res-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="A short description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="res-phone">Phone</Label>
                    <Input
                      id="res-phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1-555-0100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="res-email">Email</Label>
                    <Input
                      id="res-email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="hello@restaurant.com"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="res-address">Address</Label>
                  <Input
                    id="res-address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Main St, City"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={resetForm}>Cancel</Button>
                  <Button
                    onClick={() => {
                      if (!name.trim()) {
                        toast.error("Restaurant name is required");
                        return;
                      }
                      setStep(2);
                    }}
                  >
                    Next: Add Menu Items
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <p className="text-sm text-muted-foreground">
                  Add categories and the items you serve. You can always edit these later.
                </p>

                {categories.map((cat, catIdx) => (
                  <div key={catIdx} className="rounded-lg border p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <Input
                        value={cat.name}
                        onChange={(e) => updateCategoryName(catIdx, e.target.value)}
                        placeholder="Category name (e.g. Pizzas, Sides)"
                        className="max-w-xs"
                      />
                      {categories.length > 1 && (
                        <button onClick={() => removeCategory(catIdx)} className="text-red-500 hover:text-red-700">
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-2">
                      {cat.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="flex items-start gap-2">
                          <div className="flex-1 space-y-1">
                            <Input
                              value={item.name}
                              onChange={(e) => updateFoodItem(catIdx, itemIdx, "name", e.target.value)}
                              placeholder="Item name"
                              size={1}
                            />
                          </div>
                          <div className="w-24">
                            <Input
                              value={item.price}
                              onChange={(e) => updateFoodItem(catIdx, itemIdx, "price", e.target.value)}
                              placeholder="Price"
                              type="number"
                              step="0.01"
                              min="0"
                            />
                          </div>
                          {cat.items.length > 1 && (
                            <button
                              onClick={() => removeFoodItem(catIdx, itemIdx)}
                              className="mt-1 text-red-500 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <Button variant="ghost" size="sm" className="mt-2" onClick={() => addFoodItem(catIdx)}>
                      <Plus className="mr-1 h-3 w-3" /> Add item
                    </Button>
                  </div>
                ))}

                <Button variant="outline" size="sm" onClick={addCategory}>
                  <Plus className="mr-1 h-3 w-3" /> Add category
                </Button>

                <div className="flex justify-between gap-2 pt-2">
                  <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={resetForm}>Skip</Button>
                    <Button onClick={handleSubmit} disabled={submitting}>
                      {submitting ? (
                        <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Creating...</>
                      ) : (
                        "Create Restaurant"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
