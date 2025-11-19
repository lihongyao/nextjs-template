// src/stores/globalStore.ts
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

type GlobalStateProps = {
  count: number;
  increment: () => void;
  decrement: () => void;
};

export const useGlobalStore = create<GlobalStateProps>()(
  immer((set) => ({
    count: 0,

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
