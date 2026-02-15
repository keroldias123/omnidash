import { create } from "zustand";
import type { Product } from "@/lib/schema";

interface ProductsStoreState {
  items: Product[];
  isLoading: boolean;
  setItems: (items: Product[]) => void;
  addItem: (item: Product) => void;
  updateItem: (id: string, data: Partial<Product>) => void;
  removeItem: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useProductsStore = create<ProductsStoreState>((set) => ({
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
