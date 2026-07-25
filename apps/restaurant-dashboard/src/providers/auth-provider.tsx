"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "../store/auth-store";

const PUBLIC_ROUTES = ["/login", "/register"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { accessToken, isHydrated } = useAuthStore();

  useEffect(() => {
    if (!isHydrated) return;

    if (!accessToken && !PUBLIC_ROUTES.includes(pathname)) {
      router.replace("/login");
    }
  }, [accessToken, isHydrated, pathname, router]);

  if (!isHydrated) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return <>{children}</>;
}
