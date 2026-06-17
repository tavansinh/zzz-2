import { Toast } from '@base-ui/react/toast';
import { useEffect, useState, type FC, type ReactNode } from 'react';
import {
  CheckCircleIcon,
  WarningCircleIcon,
  InfoIcon,
  XIcon,
} from '@phosphor-icons/react';
import { setToastManager } from '@/stores/toast';

const severityIcon = {
  success: CheckCircleIcon,
  error: WarningCircleIcon,
  info: InfoIcon,
} as const;

const severityClass = {
  success: 'text-success',
  error: 'text-error',
  info: 'text-ink-muted',
} as const;

const ToastList: FC = () => {
  const { toasts } = Toast.useToastManager();
  return (
    <>
      {toasts.map((toast) => {
        const severity = (toast.type ?? 'info') as keyof typeof severityIcon;
        const Icon = severityIcon[severity];
        return (
          <Toast.Root
            key={toast.id}
            toast={toast}
            className="border-border/50 bg-surface-1 text-ink pointer-events-auto absolute right-0 bottom-0 w-full rounded-md border p-3 shadow-[0_4px_16px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.04)] transition-[transform,opacity] duration-200 ease-out data-ending-style:translate-y-1 data-ending-style:opacity-0 data-starting-style:translate-y-1 data-starting-style:opacity-0"
          >
            <Toast.Content className="flex items-start gap-3">
              <Icon
                size={20}
                weight="fill"
                className={`shrink-0 ${severityClass[severity]}`}
              />
              <div className="min-w-0 flex-1">
                <Toast.Title className="text-sm font-semibold text-balance" />
                <Toast.Description className="text-ink-muted mt-0.5 text-xs text-pretty" />
              </div>
              <Toast.Close className="text-ink-muted hover:text-ink rounded p-1 transition-colors duration-150 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white">
                <XIcon size={14} />
              </Toast.Close>
            </Toast.Content>
          </Toast.Root>
        );
      })}
    </>
  );
};

const ToastProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [manager] = useState(() => Toast.createToastManager());

  useEffect(() => {
    setToastManager(manager);
  }, [manager]);

  return (
    <Toast.Provider toastManager={manager}>
      {children}
      <Toast.Portal>
        <Toast.Viewport className="pointer-events-none fixed inset-x-0 bottom-4 z-50 mx-auto flex w-full max-w-sm flex-col-reverse gap-2 px-4 md:bottom-6">
          <ToastList />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  );
};

export { ToastProvider };
