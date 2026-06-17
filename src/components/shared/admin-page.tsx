import type { FC, ReactNode } from 'react';
import { TrashIcon } from '@phosphor-icons/react';
import { Button, Dialog } from '@/components/ui';

const AdminPageHeader: FC<{
  title: string;
  description: string;
  action?: ReactNode;
  wrap?: boolean;
}> = ({ title, description, action, wrap }) => (
  <div
    className={
      wrap
        ? 'mb-6 flex flex-wrap items-center justify-between gap-3'
        : 'mb-6 flex items-center justify-between'
    }
  >
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-balance">
        {title}
      </h1>
      <p className="text-ink-muted mt-1 text-sm text-pretty">{description}</p>
    </div>
    {action}
  </div>
);

const AdminError: FC<{ error: Error | null }> = ({ error }) => {
  if (!error) return null;
  return (
    <p
      className="text-error mb-4 text-sm text-pretty"
      role="status"
      aria-live="polite"
    >
      Lỗi: {error.message}
    </p>
  );
};

const AdminTable: FC<{
  headers: string[];
  children: ReactNode;
  empty: boolean;
  emptyText: string;
  toolbar?: ReactNode;
}> = ({ headers, children, empty, emptyText, toolbar }) => (
  <div className="bg-surface-1 border-border/50 overflow-hidden rounded-lg border shadow-[0_1px_2px_rgba(0,0,0,0.4),0_2px_6px_rgba(0,0,0,0.3)]">
    {toolbar}
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-surface-2 text-ink-muted">
          <tr>
            {headers.map((header, index) => (
              <th
                key={header}
                className={`px-4 py-3 font-medium ${index === headers.length - 1 ? 'text-right' : ''}`}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">{children}</tbody>
      </table>
    </div>

    {empty && (
      <div className="text-ink-muted py-12 text-center text-sm text-pretty">
        {emptyText}
      </div>
    )}
  </div>
);

const ConfirmDeleteDialog: FC<{
  open: boolean;
  title: string;
  description: string;
  onClose: () => void;
  onConfirm: () => void;
}> = ({ open, title, description, onClose, onConfirm }) => (
  <Dialog
    open={open}
    onOpenChange={(nextOpen) => !nextOpen && onClose()}
    title={title}
    description={description}
  >
    <div className="flex justify-end gap-2">
      <Button variant="ghost" onClick={onClose}>
        Hủy
      </Button>
      <Button variant="primary" onClick={onConfirm}>
        <TrashIcon size={16} />
        Xóa
      </Button>
    </div>
  </Dialog>
);

export { AdminError, AdminPageHeader, AdminTable, ConfirmDeleteDialog };
