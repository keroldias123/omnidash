import { create } from "zustand";
import type { Size } from "@/lib/schema";

interface SizesStoreState {
  items: Size[];
  isLoading: boolean;
  setItems: (items: Size[]) => void;
  addItem: (item: Size) => void;
  updateItem: (id: string, data: Partial<Size>) => void;
  removeItem: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useSizesStore = create<SizesStoreState>((set) => ({
  items: [],
  isLoading: false,
  setItems: (items) => set({ items }),
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  updateItem: (id, data) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, ...data } : item
      ),
    })),
  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),
  setLoading: (isLoading) => set({ isLoading }),
}));
