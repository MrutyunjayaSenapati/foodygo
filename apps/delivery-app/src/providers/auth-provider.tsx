import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { useAuthStore } from "../store/auth-store";

SplashScreen.preventAutoHideAsync();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const setLoading = useAuthStore((s) => s.setLoading);

  useEffect(() => {
    if (isHydrated) {
      setLoading(false);
      SplashScreen.hideAsync();
    }
  }, [isHydrated, setLoading]);

  return <>{children}</>;
}
