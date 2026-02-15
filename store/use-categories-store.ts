import { create } from "zustand";
import type { Category } from "@/lib/schema";

export interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[];
  parentName?: string;
}

interface CategoriesStoreState {
  items: Category[];
  isLoading: boolean;
  setItems: (items: Category[]) => void;
  addItem: (item: Category) => void;
  updateItem: (id: string, data: Partial<Category>) => void;
  removeItem: (id: string) => void;
  setLoading: (loading: boolean) => void;
  getRootCategories: () => Category[];
  getChildren: (parentId: string) => Category[];
  getTree: () => CategoryWithChildren[];
  getBreadcrumb: (categoryId: string) => Category[];
}

export const useCategoriesStore = create<CategoriesStoreState>((set, get) => ({
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

  getRootCategories: () => get().items.filter((c) => !c.parentId),

  getChildren: (parentId) =>
    get().items.filter((c) => c.parentId === parentId),

  getTree: () => {
    const items = get().items;
    const map = new Map<string, CategoryWithChildren>();
    const roots: CategoryWithChildren[] = [];

    items.forEach((item) => map.set(item.id, { ...item, children: [] }));

    map.forEach((item) => {
      if (item.parentId && map.has(item.parentId)) {
        map.get(item.parentId)!.children!.push(item);
      } else {
        roots.push(item);
      }
    });

    return roots;
  },

  getBreadcrumb: (categoryId) => {
    const items = get().items;
    const breadcrumb: Category[] = [];
    let current = items.find((c) => c.id === categoryId);

    while (current) {
      breadcrumb.unshift(current);
      current = current.parentId
        ? items.find((c) => c.id === current!.parentId)
        : undefined;
    }

    return breadcrumb;
  },
}));
