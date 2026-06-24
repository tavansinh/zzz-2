import { CircleNotchIcon } from '@phosphor-icons/react';
import type { FC } from 'react';

const Spinner: FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => (
  <CircleNotchIcon className={`animate-spin ${className}`} weight="bold" />
);

export { Spinner };
