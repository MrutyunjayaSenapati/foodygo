import { useEffect, type ReactNode } from "react";
import * as SplashScreen from "expo-splash-screen";
import { useAuthStore } from "../store/auth-store";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const setLoading = useAuthStore((s) => s.setLoading);

  useEffect(() => {
    if (isHydrated) {
      setLoading(false);
      SplashScreen.hideAsync();
    }
  }, [isHydrated, setLoading]);

  return children;
}
