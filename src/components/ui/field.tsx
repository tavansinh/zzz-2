import { Field as BaseField } from '@base-ui/react/field';
import type { FC, ReactNode } from 'react';

const labelStyles = 'text-ink-muted mb-1.5 block text-xs font-medium';

const rootStyles = 'mb-5';

const Field: {
  Root: FC<{
    children: ReactNode;
    invalid?: boolean;
    disabled?: boolean;
    className?: string;
  }>;
  Label: FC<{ children: ReactNode; className?: string }>;
  Error: FC<{
    children: ReactNode;
    className?: string;
    role?: string;
    'aria-live'?: 'off' | 'assertive' | 'polite';
  }>;
} = {
  Root: ({ children, invalid, disabled, className = '' }) => (
    <BaseField.Root
      invalid={invalid}
      disabled={disabled}
      className={`${rootStyles} ${className}`}
    >
      {children}
    </BaseField.Root>
  ),
  Label: ({ children, className = '' }) => (
    <BaseField.Label className={`${labelStyles} ${className}`}>
      {children}
    </BaseField.Label>
  ),
  Error: ({ children, className = '', role, 'aria-live': ariaLive }) => (
    <BaseField.Error
      className={`mt-1.5 text-xs text-error text-pretty ${className}`}
      role={role}
      aria-live={ariaLive}
    >
      {children}
    </BaseField.Error>
  ),
};

export { Field };
