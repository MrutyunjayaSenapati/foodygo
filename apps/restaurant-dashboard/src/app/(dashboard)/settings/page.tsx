"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useRestaurantStore } from "@/store/restaurant-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/providers/theme-provider";
import { toast } from "sonner";
import { Save, Sun, Moon, Monitor, Store, Image, Palette } from "lucide-react";

interface RestaurantProfile {
  id: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  phone: string | null;
  email: string | null;
  address: string;
  latitude: string;
  longitude: string;
  rating: string;
  status: string;
}

const THEME_OPTIONS = [
  { value: "light" as const, label: "Light", icon: Sun },
  { value: "dark" as const, label: "Dark", icon: Moon },
  { value: "system" as const, label: "System", icon: Monitor },
];

export default function SettingsPage() {
  const { selectedRestaurant } = useRestaurantStore();
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    name: "",
    description: "",
    phone: "",
    email: "",
    address: "",
    latitude: "",
    longitude: "",
    logoUrl: "",
    coverUrl: "",
  });

  const { data, isLoading } = useQuery<RestaurantProfile>({
    queryKey: ["restaurant-profile", selectedRestaurant?.id],
    queryFn: async () => {
      const res = await apiClient.get(`/restaurants/${selectedRestaurant!.id}`);
      return res.data.data;
    },
    enabled: !!selectedRestaurant,
  });

  useEffect(() => {
    if (data) {
      setForm({
        name: data.name ?? "",
        description: data.description ?? "",
        phone: data.phone ?? "",
        email: data.email ?? "",
        address: data.address ?? "",
        latitude: data.latitude ?? "",
        longitude: data.longitude ?? "",
        logoUrl: data.logoUrl ?? "",
        coverUrl: data.coverUrl ?? "",
      });
    }
  }, [data]);

  const updateMut = useMutation({
    mutationFn: async (body: Record<string, string>) => {
      const res = await apiClient.patch(`/restaurants/${selectedRestaurant!.id}`, body);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurant-profile", selectedRestaurant?.id] });
      toast.success("Settings saved");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message ?? "Failed to save settings");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const body: Record<string, string> = {};
    if (form.name !== data?.name) body.name = form.name;
    if (form.description !== (data?.description ?? "")) body.description = form.description;
    if (form.phone !== (data?.phone ?? "")) body.phone = form.phone;
    if (form.email !== (data?.email ?? "")) body.email = form.email;
    if (form.address !== data?.address) body.address = form.address;
    if (form.latitude !== data?.latitude) body.latitude = form.latitude;
    if (form.longitude !== data?.longitude) body.longitude = form.longitude;
    if (form.logoUrl !== (data?.logoUrl ?? "")) body.logoUrl = form.logoUrl;
    if (form.coverUrl !== (data?.coverUrl ?? "")) body.coverUrl = form.coverUrl;
    if (Object.keys(body).length === 0) {
      toast.info("No changes to save");
      return;
    }
    updateMut.mutate(body);
  };

  if (!selectedRestaurant) {
    return <EmptyState title="No restaurant selected" description="Select a restaurant from the sidebar to get started." />;
  }

  if (isLoading) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-card-foreground">Settings</h1>
        <div className="rounded-xl border bg-card p-6">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-card-foreground">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your restaurant profile and preferences</p>
        </div>
        <Badge variant={data?.status === "APPROVED" ? "success" : data?.status === "PENDING" ? "warning" : "destructive"}>
          {data?.status ?? "UNKNOWN"}
        </Badge>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border bg-card shadow-sm">
          <div className="flex items-center gap-3 border-b px-6 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Store className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-card-foreground">Basic Information</h2>
              <p className="text-xs text-muted-foreground">Your restaurant name, contact details, and location</p>
            </div>
          </div>
          <div className="p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">Restaurant Name</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="latitude">Latitude</Label>
                <Input id="latitude" type="number" step="any" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="longitude">Longitude</Label>
                <Input id="longitude" type="number" step="any" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} required />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card shadow-sm">
          <div className="flex items-center gap-3 border-b px-6 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
              <Image className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold text-card-foreground">Branding</h2>
              <p className="text-xs text-muted-foreground">Logo and cover image URLs for your restaurant</p>
            </div>
          </div>
          <div className="p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input id="logoUrl" value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} placeholder="https://example.com/logo.png" />
              </div>
              <div>
                <Label htmlFor="coverUrl">Cover URL</Label>
                <Input id="coverUrl" value={form.coverUrl} onChange={(e) => setForm({ ...form, coverUrl: e.target.value })} placeholder="https://example.com/cover.jpg" />
              </div>
            </div>
            {(form.logoUrl || form.coverUrl) && (
              <div className="mt-4 flex gap-4 rounded-lg bg-muted/30 p-4">
                {form.logoUrl && (
                  <div>
                    <p className="mb-1 text-xs text-muted-foreground">Logo</p>
                    <img src={form.logoUrl} alt="Logo" className="h-16 w-16 rounded-lg border object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  </div>
                )}
                {form.coverUrl && (
                  <div className="flex-1">
                    <p className="mb-1 text-xs text-muted-foreground">Cover</p>
                    <img src={form.coverUrl} alt="Cover" className="h-16 w-full rounded-lg border object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border bg-card shadow-sm">
          <div className="flex items-center gap-3 border-b px-6 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10">
              <Palette className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <h2 className="font-semibold text-card-foreground">Appearance</h2>
              <p className="text-xs text-muted-foreground">Choose your dashboard theme</p>
            </div>
          </div>
          <div className="p-6">
            <div className="flex gap-2">
              {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTheme(value)}
                  className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                    theme === value
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-input text-muted-foreground hover:border-muted-foreground/30 hover:bg-accent"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={updateMut.isPending} className="min-w-[140px]">
            <Save className="mr-1 h-4 w-4" />
            {updateMut.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
