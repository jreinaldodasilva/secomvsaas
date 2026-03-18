import { create } from 'zustand';
import type { ToastItem, ToastType } from './Toast';

interface ToastStore {
  toasts: ToastItem[];
  add: (type: ToastType, message: string, title?: string, duration?: number) => void;
  remove: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add: (type, message, title, duration) =>
    set(s => ({
      toasts: [
        ...s.toasts.slice(-4), // keep max 5
        { id: `${Date.now()}-${Math.random()}`, type, message, title, duration },
      ],
    })),
  remove: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
}));
