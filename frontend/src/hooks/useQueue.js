import { createContext, useContext } from "react";

export const QueueContext = createContext(null);

export function useQueue() {
  const ctx = useContext(QueueContext);
  if (!ctx) {
    throw new Error("useQueue must be used within a QueueProvider");
  }
  return ctx;
}
