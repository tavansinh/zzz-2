import { toErrorMessage } from '@/lib/errors';

interface ToastApi {
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const reportError = (
  toast: ToastApi,
  err: unknown,
  fallbackTitle = 'Có lỗi xảy ra',
): void => {
  toast.error(fallbackTitle, toErrorMessage(err));
};

export type { ToastApi };
export { reportError };
