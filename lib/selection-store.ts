import { create } from 'zustand';
import type { Doc, Id } from '@/convex/_generated/dataModel';

type ItemDoc = Doc<'items'>;
export type ItemCategory = NonNullable<ItemDoc['category']>;

type SelectionState = {
  selectedByCategory: Partial<Record<ItemCategory, Id<'items'>>>;
  getSelected: (category: ItemCategory) => Id<'items'> | null;
  setSelected: (category: ItemCategory, id: Id<'items'>) => void;
  clearSelected: (category: ItemCategory) => void;
  reset: () => void;
};

export const useSelectionStore = create<SelectionState>((set, get) => ({
  selectedByCategory: {},
  getSelected: (category) => get().selectedByCategory[category] ?? null,
  setSelected: (category, id) =>
    set((state) => ({
      selectedByCategory: { ...state.selectedByCategory, [category]: id },
    })),
  clearSelected: (category) =>
    set((state) => {
      const next = { ...state.selectedByCategory };
      delete next[category];
      return { selectedByCategory: next };
    }),
  reset: () => set({ selectedByCategory: {} }),
}));


