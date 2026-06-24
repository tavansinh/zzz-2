import { Input as BaseInput } from '@base-ui/react/input';
import type { InputProps } from '@base-ui/react/input';
import { forwardRef } from 'react';

interface UIInputProps extends Omit<InputProps, 'className'> {
  className?: string;
}

const focusRing =
  'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white';

const Input = forwardRef<HTMLInputElement, UIInputProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <BaseInput
        ref={ref}
        className={`border-border bg-surface-1 w-full min-h-11 rounded-md border px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted/60 outline-none transition-colors duration-200 focus:border-primary ${focusRing} data-disabled:cursor-not-allowed data-disabled:opacity-50 ${className}`}
        {...props}
      />
    );
  },
);

Input.displayName = 'Input';

export { Input };
