import { create } from "zustand";
import type { Billboard } from "@/lib/schema";

interface BillboardsStoreState {
  items: Billboard[];
  isLoading: boolean;
  setItems: (items: Billboard[]) => void;
  addItem: (item: Billboard) => void;
  updateItem: (id: string, data: Partial<Billboard>) => void;
  removeItem: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useBillboardsStore = create<BillboardsStoreState>((set) => ({
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
