import {
  useEffect,
  useId,
  useMemo,
  useState,
  type FC,
  type ReactNode,
} from 'react';
import { Combobox } from '@base-ui/react/combobox';
import {
  CheckIcon,
  XIcon,
  BankIcon,
  CaretDownIcon,
} from '@phosphor-icons/react';
import { findBank, getBanks } from '@/lib/banks';
import type { Bank } from '@/types/bank';

const renderBankItem = (bank: Bank): ReactNode => (
  <Combobox.Item
    key={bank.code}
    value={bank}
    className="data-highlighted:bg-white/5 grid cursor-default grid-cols-[auto_1fr_auto] items-center gap-3 rounded px-2 py-2 text-sm outline-none transition-colors duration-100"
  >
    <BankLogo bank={bank} size={32} />
    <span className="flex min-w-0 flex-col items-start text-left">
      <span className="truncate text-sm font-medium text-ink">
        {bank.shortName}
      </span>
      <span className="text-ink-muted text-xs tabular-nums">
        {bank.code} · {bank.bin}
      </span>
    </span>
    <Combobox.ItemIndicator className="text-primary shrink-0">
      <CheckIcon size={16} weight="bold" />
    </Combobox.ItemIndicator>
  </Combobox.Item>
);

interface BankSelectProps {
  value: string;
  onChange: (value: string) => void;
  label?: ReactNode;
  disabled?: boolean;
  className?: string;
  required?: boolean;
}

const BankLogo: FC<{ bank: Bank | undefined; size?: number }> = ({
  bank,
  size = 24,
}) => {
  const [errored, setErrored] = useState(false);
  const showFallback = !bank || errored;

  if (showFallback) {
    return (
      <div
        className="flex shrink-0 items-center justify-center rounded-md bg-surface-2 text-ink-muted"
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        <BankIcon size={Math.round(size * 0.6)} weight="fill" />
      </div>
    );
  }

  return (
    <img
      key={bank.code}
      src={bank.logo}
      alt={bank.shortName}
      width={size}
      height={size}
      draggable={false}
      className="shrink-0 rounded-md bg-white object-contain p-0.5 img-outline"
      style={{ width: size, height: size }}
      onError={() => setErrored(true)}
    />
  );
};

const BankSelect: FC<BankSelectProps> = ({
  value,
  onChange,
  label,
  disabled,
  className = '',
  required,
}) => {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { contains } = Combobox.useFilter();
  const selected = useMemo(() => findBank(banks, value), [banks, value]);
  const inputId = useId();

  useEffect(() => {
    let cancelled = false;

    getBanks()
      .then((data) => {
        if (!cancelled) setBanks(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          console.warn('err fetching banks', err);
          setLoadError('Không tải được danh sách ngân hàng');
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingBanks(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!value) return;

    const bank = findBank(banks, value);
    if (bank && bank.bin !== value) onChange(bank.bin);
  }, [banks, onChange, value]);

  const customFilter = useMemo(
    () => (item: Bank, query: string) => {
      if (!query) return true;
      return (
        contains(item.code, query) ||
        contains(item.shortName, query) ||
        contains(item.fullName, query) ||
        contains(item.bin, query)
      );
    },
    [contains],
  );

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {loadingBanks || loadError ? (
        <>
          {label && (
            <label
              htmlFor={inputId}
              className="text-ink-muted text-xs font-medium"
            >
              {label}
            </label>
          )}
          <div className="border-border bg-surface-1 flex w-full items-center rounded-md border opacity-60 min-h-11">
            <div className="pl-3 pr-2">
              <BankLogo bank={selected} size={28} />
            </div>
            <input
              type="text"
              disabled
              aria-label={
                loadError ? 'Không tải được ngân hàng' : 'Đang tải ngân hàng'
              }
              placeholder={
                loadError ? 'Không tải được ngân hàng' : 'Đang tải ngân hàng…'
              }
              className="text-ink placeholder:text-ink-muted/60 min-w-0 grow bg-transparent text-sm outline-none disabled:cursor-not-allowed"
            />
            <span className="border-border/40 ml-1 mr-1 h-5 border-l" />
            <span className="text-ink-muted rounded p-2">
              <CaretDownIcon size={14} weight="bold" />
            </span>
          </div>
        </>
      ) : (
        <Combobox.Root
          items={banks}
          value={selected}
          onValueChange={(bank) => onChange(bank?.bin ?? '')}
          itemToStringLabel={(bank: Bank) => bank.shortName}
          itemToStringValue={(bank: Bank) => bank.bin}
          isItemEqualToValue={(a, b) => a?.bin === b?.bin}
          filter={customFilter}
          disabled={disabled}
          required={required}
          defaultInputValue={selected?.shortName ?? ''}
        >
          <div className="flex flex-col gap-1.5">
            {label && (
              <label
                htmlFor={inputId}
                className="text-ink-muted text-xs font-medium"
              >
                {label}
              </label>
            )}
            <Combobox.InputGroup className="border-border bg-surface-1 hover:border-border/80 focus-within:border-primary group flex w-full min-h-11 items-center rounded-md border outline-none transition-colors duration-200 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-white data-disabled:opacity-50">
              <div className="pl-3 pr-2">
                <BankLogo
                  key={selected?.logo ?? 'empty-bank'}
                  bank={selected}
                  size={28}
                />
              </div>
              <Combobox.Input
                id={inputId}
                placeholder="Chọn ngân hàng"
                className="text-ink placeholder:text-ink-muted/60 min-w-0 grow bg-transparent text-sm outline-none"
              />
              {selected && (
                <Combobox.Clear
                  aria-label="Xóa lựa chọn"
                  className="text-ink-muted hover:text-ink rounded p-1.5 transition-colors duration-150 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white"
                >
                  <XIcon size={14} weight="bold" />
                </Combobox.Clear>
              )}
              <span className="border-border/40 ml-1 mr-1 h-5 border-l" />
              <Combobox.Trigger
                aria-label="Mở danh sách"
                className="text-ink-muted hover:text-ink rounded p-2 transition-colors duration-150 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white"
              >
                <CaretDownIcon
                  size={14}
                  weight="bold"
                  className="transition-transform duration-200 ease-out group-data-popup-open:rotate-180"
                />
              </Combobox.Trigger>
            </Combobox.InputGroup>
          </div>
          <Combobox.Portal>
            <Combobox.Positioner
              sideOffset={6}
              className="z-50 max-h-(--available-height) min-w-(--anchor-width) outline-none"
            >
              <Combobox.Popup className="bg-surface-1 border-border/50 origin-(--transform-origin) overflow-hidden rounded-md border shadow-[0_4px_16px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.04)] transition-[transform,opacity] duration-150 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0">
                <Combobox.Empty className="text-ink-muted px-4 py-6 text-center text-sm">
                  Không tìm thấy ngân hàng phù hợp
                </Combobox.Empty>
                <Combobox.List className="max-h-72 overflow-y-auto overscroll-contain p-1">
                  {renderBankItem}
                </Combobox.List>
              </Combobox.Popup>
            </Combobox.Positioner>
          </Combobox.Portal>
        </Combobox.Root>
      )}
    </div>
  );
};

export { BankSelect };
