// src/stores/globalStore.ts
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

type GlobalStateProps = {
  isSidebarOpen: boolean;
  count: number;
  toggleSidebar: () => void;
  increment: () => void;
  decrement: () => void;
};

export const useGlobalStore = create<GlobalStateProps>()(
  immer((set) => ({
    count: 0,
    isSidebarOpen: true,
    toggleSidebar: () =>
      set((state) => {
        state.isSidebarOpen = !state.isSidebarOpen;
      }),
    increment: () =>
      set((state) => {
        state.count += 1;
      }),
    decrement: () =>
      set((state) => {
        state.count -= 1;
      }),
  })),
);
