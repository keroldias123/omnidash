import { create } from "zustand";
import type { Color } from "@/lib/schema";

interface ColorsStoreState {
  items: Color[];
  isLoading: boolean;
  setItems: (items: Color[]) => void;
  addItem: (item: Color) => void;
  updateItem: (id: string, data: Partial<Color>) => void;
  removeItem: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useColorsStore = create<ColorsStoreState>((set) => ({
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
