export type IslandToastVariant = "success" | "error" | "default";

export type IslandToastItem = { id: string; message: string; variant: IslandToastVariant };

export type IslandToastEnqueue = (item: Omit<IslandToastItem, "id">) => void;

let bridgeEnqueue: IslandToastEnqueue | undefined;

export function setIslandToastEnqueue(fn: IslandToastEnqueue | undefined) {
  bridgeEnqueue = fn;
}

export const toast = {
  success(message: string) {
    bridgeEnqueue?.({ message, variant: "success" });
  },
  error(message: string) {
    bridgeEnqueue?.({ message, variant: "error" });
  },
  message(message: string) {
    bridgeEnqueue?.({ message, variant: "default" });
  },
};
