"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useRestaurantStore } from "@/store/restaurant-store";
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  Star,
  Settings,
  ChevronLeft,
  Store,
  Plus,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/orders", label: "Orders", icon: ShoppingBag },
  { href: "/menu", label: "Menu", icon: UtensilsCrossed },
  { href: "/reviews", label: "Reviews", icon: Star },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { selectedRestaurant } = useRestaurantStore();

  return (
    <aside
      className={cn(
        "flex flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-200",
        collapsed ? "w-16" : "w-60",
      )}
    >
      <div className="flex h-14 items-center justify-between border-b border-white/10 px-4">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2 font-bold">
            <Store className="h-5 w-5 text-primary" />
            <span>FoodyGo</span>
          </Link>
        )}
        <button
          onClick={onToggle}
          className={cn(
            "rounded-md p-1.5 hover:bg-white/10",
            collapsed && "mx-auto",
          )}
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </button>
      </div>

      {!collapsed && selectedRestaurant && (
        <div className="border-b border-white/10 px-4 py-3">
          <p className="text-xs text-white/50">Managing</p>
          <p className="truncate text-sm font-medium">{selectedRestaurant.name}</p>
        </div>
      )}

      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary/20 text-primary"
                  : "text-white/70 hover:bg-white/10 hover:text-white",
                collapsed && "justify-center px-2",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-2">
        <Link
          href="/restaurants/select"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors text-white/70 hover:bg-white/10 hover:text-white",
            collapsed && "justify-center px-2",
          )}
        >
          <Store className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Switch Restaurant</span>}
        </Link>
      </div>
    </aside>
  );
}
