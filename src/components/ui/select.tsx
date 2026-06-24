import { Select as BaseSelect } from '@base-ui/react/select';
import { CaretUpDownIcon, CheckIcon } from '@phosphor-icons/react';
import { type FC, type ReactNode } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: ReactNode;
  disabled?: boolean;
  className?: string;
}

const Select: FC<SelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Chọn…',
  label,
  disabled,
  className = '',
}) => {
  return (
    <BaseSelect.Root
      value={value}
      items={options}
      onValueChange={(value) => onChange(value ?? '')}
      disabled={disabled}
    >
      <div className={`flex flex-col gap-1.5 ${className}`}>
        {label && (
          <BaseSelect.Label className="text-ink-muted text-xs font-medium">
            {label}
          </BaseSelect.Label>
        )}
        <BaseSelect.Trigger className="border-border bg-surface-1 text-ink flex min-h-11 w-full items-center justify-between rounded-md border px-3 py-2.5 text-sm outline-none transition-colors duration-200 hover:border-border/80 focus:border-primary focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white data-disabled:cursor-not-allowed data-disabled:opacity-50">
          <BaseSelect.Value
            placeholder={placeholder}
            className="data-placeholder:text-ink-muted/60"
          />
          <BaseSelect.Icon>
            <CaretUpDownIcon size={14} />
          </BaseSelect.Icon>
        </BaseSelect.Trigger>
      </div>
      <BaseSelect.Portal>
        <BaseSelect.Positioner className="z-50" sideOffset={4}>
          <BaseSelect.Popup className="bg-surface-1 border-border/50 min-w-(--anchor-width) origin-(--transform-origin) rounded-md border py-1 shadow-[0_4px_16px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.04)] transition-[transform,opacity] duration-150 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0">
            <BaseSelect.List className="max-h-60 overflow-y-auto overscroll-contain py-1">
              {options.map((option) => (
                <BaseSelect.Item
                  key={option.value}
                  value={option.value}
                  className="text-ink grid cursor-default grid-cols-[1rem_1fr] items-center gap-2 px-3 py-2 text-sm outline-none transition-colors duration-100 data-highlighted:bg-white/5"
                >
                  <BaseSelect.ItemIndicator className="col-start-1">
                    <CheckIcon size={12} />
                  </BaseSelect.ItemIndicator>
                  <BaseSelect.ItemText className="col-start-2">
                    {option.label}
                  </BaseSelect.ItemText>
                </BaseSelect.Item>
              ))}
            </BaseSelect.List>
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  );
};

export { Select };
