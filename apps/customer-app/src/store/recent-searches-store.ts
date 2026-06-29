import { create } from "zustand";

const MAX_RECENT_SEARCHES = 10;

interface RecentSearchesState {
  searches: string[];
  addSearch: (query: string) => void;
  removeSearch: (query: string) => void;
  clearSearches: () => void;
}

export const useRecentSearchesStore = create<RecentSearchesState>()((set) => ({
  searches: [],
  addSearch: (query) =>
    set((state) => {
      const filtered = state.searches.filter((s) => s !== query);
      return { searches: [query, ...filtered].slice(0, MAX_RECENT_SEARCHES) };
    }),
  removeSearch: (query) =>
    set((state) => ({
      searches: state.searches.filter((s) => s !== query),
    })),
  clearSearches: () => set({ searches: [] }),
}));
