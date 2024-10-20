import { create } from "zustand";

const useAppstore = create((set) => ({
  userSpeakingState: "finish", // finish | start
  live2dSpeakingState: "finish", // finish | start
  llmOutputList: [],
  // increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
  // removeAllBears: () => set({ bears: 0 }),
  // updateBears: (newBears) => set({ bears: newBears }),
}));

export default useAppstore;
