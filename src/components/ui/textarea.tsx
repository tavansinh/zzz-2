import { forwardRef, type TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

const focusRing =
  'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white';

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`border-border bg-surface-1 min-h-20 w-full resize-y rounded-md border px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted/60 outline-none transition-colors duration-200 focus:border-primary ${focusRing} disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...props}
      />
    );
  },
);

Textarea.displayName = 'Textarea';

export { Textarea };
