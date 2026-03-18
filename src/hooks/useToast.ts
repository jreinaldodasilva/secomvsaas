import { useToastStore } from '@/components/UI/Toast/toastStore';

export function useToast() {
  const { add } = useToastStore();
  return {
    success: (message: string, title?: string) => add('success', message, title),
    error:   (message: string, title?: string) => add('error',   message, title),
    warning: (message: string, title?: string) => add('warning', message, title),
    info:    (message: string, title?: string) => add('info',    message, title),
  };
}
