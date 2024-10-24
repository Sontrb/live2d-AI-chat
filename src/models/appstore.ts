import { create } from "zustand";

const useAppstore = create((_set) => ({
  bears: 1,
  // increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
  // removeAllBears: () => set({ bears: 0 }),
  // updateBears: (newBears) => set({ bears: newBears }),
}));

export default useAppstore;
