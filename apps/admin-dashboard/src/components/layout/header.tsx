"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/auth-store";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogOut, User } from "lucide-react";

export function Header() {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    router.replace("/login");
  };

  return (
    <header className="flex h-14 items-center justify-end gap-4 border-b bg-background px-6">
      <ThemeToggle />
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span>{user?.fullName ?? "Admin"}</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </header>
  );
}
