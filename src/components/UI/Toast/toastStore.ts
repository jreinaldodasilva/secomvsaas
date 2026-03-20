import { create } from 'zustand';
import type { ToastItem, ToastType } from './Toast';

interface ToastStore {
  toasts: ToastItem[];
  add: (type: ToastType, message: string, title?: string, duration?: number) => void;
  remove: (id: string) => void;
}

const initialToastState = { toasts: [] as ToastItem[] };

export const useToastStore = create<ToastStore>((set) => ({
  ...initialToastState,
  add: (type, message, title, duration) =>
    set(s => ({
      toasts: [
        ...s.toasts.slice(-4), // keep max 5
        { id: `${Date.now()}-${Math.random()}`, type, message, title, duration },
      ],
    })),
  remove: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
}));

/** Resets store to its initial state. Call in `afterEach` to prevent test state leakage. */
export function resetToastStore() {
  useToastStore.setState(initialToastState);
}
