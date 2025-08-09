import { create } from "zustand";

interface HeaderStore {
  title: string;
  setTitle: (title: string) => void;
}

export const useHeader = create<HeaderStore>((set) => ({
  title: "",
  setTitle: (title) => set({ title }),
}));
