import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface RestaurantInfo {
  id: string;
  name: string;
  logoUrl: string | null;
}

interface RestaurantState {
  selectedRestaurant: RestaurantInfo | null;
  selectRestaurant: (restaurant: RestaurantInfo) => void;
  clearRestaurant: () => void;
}

export const useRestaurantStore = create<RestaurantState>()(
  persist(
    (set) => ({
      selectedRestaurant: null,
      selectRestaurant: (restaurant) => set({ selectedRestaurant: restaurant }),
      clearRestaurant: () => set({ selectedRestaurant: null }),
    }),
    {
      name: "foodygo-restaurant-selected",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedRestaurant: state.selectedRestaurant,
      }),
    },
  ),
);
