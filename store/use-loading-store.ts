import { create } from "zustand";

interface LoadingStoreState {
  globalLoading: boolean;
  loadingKeys: Set<string>;
  setGlobalLoading: (loading: boolean) => void;
  startLoading: (key: string) => void;
  stopLoading: (key: string) => void;
  isLoadingKey: (key: string) => boolean;
}

export const useLoadingStore = create<LoadingStoreState>((set, get) => ({
  globalLoading: false,
  loadingKeys: new Set<string>(),
  setGlobalLoading: (globalLoading) => set({ globalLoading }),
  startLoading: (key) =>
    set((state) => {
      const newKeys = new Set(state.loadingKeys);
      newKeys.add(key);
      return { loadingKeys: newKeys };
    }),
  stopLoading: (key) =>
    set((state) => {
      const newKeys = new Set(state.loadingKeys);
      newKeys.delete(key);
      return { loadingKeys: newKeys };
    }),
  isLoadingKey: (key) => get().loadingKeys.has(key),
}));
