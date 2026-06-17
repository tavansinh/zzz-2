import { Button as BaseButton } from '@base-ui/react/button';
import type { ButtonProps } from '@base-ui/react/button';
import { forwardRef } from 'react';

interface UIButtonProps extends Omit<ButtonProps, 'className'> {
  variant?: 'primary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  static?: boolean;
  className?: string;
}

const focusRing =
  'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white';

const pressScale = 'motion-safe:active:not-disabled:scale-[0.96]';

const variantStyles: Record<string, string> = {
  primary: `bg-primary hover:not-data-disabled:bg-primary-hover text-white ${focusRing}`,
  ghost: `bg-transparent hover:not-data-disabled:bg-white/8 active:not-data-disabled:bg-white/12 text-ink ${focusRing}`,
  outline: `border border-border bg-transparent hover:not-data-disabled:bg-white/8 active:not-data-disabled:bg-white/12 text-ink ${focusRing}`,
};

const sizeStyles: Record<string, string> = {
  sm: 'min-h-9 px-3 py-1.5 text-xs',
  md: 'min-h-11 px-4 py-2 text-sm',
  lg: 'min-h-12 px-6 py-2.5 text-sm',
};

const Button = forwardRef<HTMLButtonElement, UIButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      static: isStatic,
      className = '',
      ...props
    },
    ref,
  ) => {
    return (
      <BaseButton
        ref={ref}
        className={`inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-[transform,background-color,border-color] duration-200 data-disabled:cursor-not-allowed data-disabled:opacity-50 select-none ${variantStyles[variant]} ${sizeStyles[size]} ${isStatic ? '' : `motion-safe:transition-transform ${pressScale}`} ${className}`}
        {...props}
      />
    );
  },
);

Button.displayName = 'Button';

export { Button };
