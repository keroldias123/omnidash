import { create } from "zustand";
import type { Store } from "@/lib/schema";

interface ActiveStoreState {
  store: Store | null;
  stores: Store[];
  isLoading: boolean;
  setStore: (store: Store | null) => void;
  setStores: (stores: Store[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useActiveStore = create<ActiveStoreState>((set) => ({
  store: null,
  stores: [],
  isLoading: false,
  setStore: (store) => set({ store }),
  setStores: (stores) => set({ stores }),
  setLoading: (isLoading) => set({ isLoading }),
}));
