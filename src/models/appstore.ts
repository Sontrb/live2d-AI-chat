import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useShallow } from "zustand/shallow";

type AppStore = {
  backendEndpoint: string;
  setBackendEndpoint: (backendEndpoint: string) => void;
  useBackendLLM: boolean;
  setUseBackendLLM: (useBackendLLM: boolean) => void;
  openaiEndpoint: string;
  setOpenaiEndpoint: (openaiEndpoint: string) => void;
  openaiApikey: string;
  setOpenaiApikey: (openaiApikey: string) => void;
  openaiModelName: string;
  setOpenaiModelName: (openaiModelName: string) => void;
};

const useAppStore = create<AppStore>()(
  persist(
    (_set, _get) => ({
      backendEndpoint: "http://localhost:61234",
      setBackendEndpoint: (backendEndpoint: string) =>
        _set({ backendEndpoint }),
      useBackendLLM: false,
      setUseBackendLLM: (useBackendLLM: boolean) => _set({ useBackendLLM }),
      openaiEndpoint: "http://localhost:11434/v1",
      setOpenaiEndpoint: (openaiEndpoint: string) => _set({ openaiEndpoint }),
      openaiApikey: "",
      setOpenaiApikey: (openaiApikey: string) => _set({ openaiApikey }),
      openaiModelName: "llama3.1",
      setOpenaiModelName: (openaiModelName: string) =>
        _set({ openaiModelName }),
    }),
    { name: "tts" }
  )
);

export function getBackendEndpoint() {
  return useAppStore.getState().backendEndpoint;
}

export const useBackendEndpoint = (): [
  string,
  (backendEndpoint: string) => void
] =>
  useAppStore(
    useShallow((state) => [state.backendEndpoint, state.setBackendEndpoint])
  );
export const useUseBackendLLM = (): [
  boolean,
  (useBackendLLM: boolean) => void
] =>
  useAppStore(
    useShallow((state) => [state.useBackendLLM, state.setUseBackendLLM])
  );
export const useOpenaiEndpoint = (): [
  string,
  (openaiEndpoint: string) => void
] =>
  useAppStore(
    useShallow((state) => [state.openaiEndpoint, state.setOpenaiEndpoint])
  );
export const useOpenaiApikey = (): [string, (openaiApikey: string) => void] =>
  useAppStore(
    useShallow((state) => [state.openaiApikey, state.setOpenaiApikey])
  );
export const useOpenaiModelName = (): [
  string,
  (openaiModelName: string) => void
] =>
  useAppStore(
    useShallow((state) => [state.openaiModelName, state.setOpenaiModelName])
  );

export default useAppStore;
