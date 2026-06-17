import { create } from 'zustand';
import { Toast } from '@base-ui/react/toast';

type ToastSeverity = 'success' | 'error' | 'info';

interface ShowArgs {
  title: string;
  description?: string;
  severity?: ToastSeverity;
  duration?: number;
}

interface ToastState {
  manager: ReturnType<typeof Toast.createToastManager> | null;
  setManager: (manager: ReturnType<typeof Toast.createToastManager>) => void;
  show: (args: ShowArgs) => void;
}

const useToastStore = create<ToastState>((set, get) => ({
  manager: null,
  setManager: (manager) => set({ manager }),
  show: ({ title, description, severity, duration }) => {
    const manager = get().manager;
    if (!manager) return;
    manager.add({
      title,
      description,
      type: severity ?? 'info',
      ...(duration !== undefined ? { duration } : {}),
    });
  },
}));

const useToast = () => {
  const show = useToastStore((s) => s.show);
  return {
    success: (title: string, description?: string) =>
      show({
        title,
        ...(description !== undefined ? { description } : {}),
        severity: 'success',
      }),
    error: (title: string, description?: string) =>
      show({
        title,
        ...(description !== undefined ? { description } : {}),
        severity: 'error',
      }),
    info: (title: string, description?: string) =>
      show({
        title,
        ...(description !== undefined ? { description } : {}),
        severity: 'info',
      }),
  };
};

const setToastManager = (
  manager: ReturnType<typeof Toast.createToastManager>,
) => useToastStore.getState().setManager(manager);

export { setToastManager, useToast };
