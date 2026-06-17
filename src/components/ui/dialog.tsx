import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { type FC, type ReactNode } from 'react';
import { XIcon } from '@phosphor-icons/react';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  trigger?: ReactNode;
}

const Dialog: FC<DialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  trigger,
}) => {
  return (
    <BaseDialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <BaseDialog.Trigger>{trigger}</BaseDialog.Trigger>}
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className="fixed inset-0 min-h-dvh bg-black/60 motion-safe:animate-[modal-overlay_200ms_cubic-bezier(0.25,1,0.5,1)] data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <BaseDialog.Popup className="bg-surface-1 border-border/50 fixed left-1/2 top-1/2 z-50 flex w-full max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col gap-4 rounded-lg border p-5 shadow-[0_4px_16px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.04)] motion-safe:animate-[modal-content_240ms_cubic-bezier(0.16,1,0.3,1)] data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <BaseDialog.Title className="text-lg font-semibold tracking-tight text-ink text-balance">
                {title}
              </BaseDialog.Title>
              {description && (
                <BaseDialog.Description className="text-ink-muted mt-1 text-sm text-pretty">
                  {description}
                </BaseDialog.Description>
              )}
            </div>
            <BaseDialog.Close className="text-ink-muted hover:text-ink rounded-md p-1 transition-colors duration-150 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white">
              <XIcon size={18} />
            </BaseDialog.Close>
          </div>
          <div className="flex-1">{children}</div>
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
};

export { Dialog };
