import { Popover } from '@base-ui/react/popover';
import {
  ArrowUpRightIcon,
  ChatCircleDotsIcon,
  MessengerLogoIcon,
  TelegramLogoIcon,
  XIcon,
} from '@phosphor-icons/react';
import {
  useState,
  type ComponentType,
  type FC,
  type SVGAttributes,
} from 'react';

interface Channel {
  id: 'messenger' | 'telegram';
  label: string;
  description: string;
  href: string;
  icon: ComponentType<
    SVGAttributes<SVGSVGElement> & {
      size?: number;
      weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
    }
  >;
  accent: string;
}

const CHANNELS: Channel[] = [
  {
    id: 'messenger',
    label: 'Messenger',
    description: 'Phản hồi trong vài phút',
    href: process.env.MESSENGER_URL ?? '',
    icon: MessengerLogoIcon as Channel['icon'],
    accent: 'from-[#00B2FF] to-[#006AFF]',
  },
  {
    id: 'telegram',
    label: 'Telegram',
    description: 'Hỗ trợ 24/7',
    href: process.env.TELEGRAM_URL ?? '',
    icon: TelegramLogoIcon as Channel['icon'],
    accent: 'from-[#37BBFE] to-[#007DBB]',
  },
];

const ChatSupport: FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-40 sm:bottom-6 sm:right-6">
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger
          aria-label="Mở kênh hỗ trợ"
          className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-[0_8px_24px_-4px_rgba(229,9,20,0.6)] outline-none transition-[transform,background-color,box-shadow] duration-200 ease-out hover:bg-primary-hover hover:shadow-[0_12px_32px_-4px_rgba(229,9,20,0.7)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-safe:active:scale-[0.94] data-[popup-open]:bg-primary-hover data-[popup-open]:shadow-[0_4px_16px_-4px_rgba(229,9,20,0.4)] motion-reduce:transition-none"
        >
          <ChatCircleDotsIcon
            size={28}
            weight="fill"
            className="transition-all duration-200 ease-out group-data-[popup-open]:scale-50 group-data-[popup-open]:opacity-0"
          />
          <XIcon
            size={26}
            weight="bold"
            aria-hidden
            className="absolute transition-all duration-200 ease-out scale-50 opacity-0 group-data-[popup-open]:scale-100 group-data-[popup-open]:opacity-100"
          />
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner
            side="top"
            align="end"
            sideOffset={12}
            collisionAvoidance={{ align: 'shift', side: 'flip' }}
            className="z-50 outline-none"
          >
            <Popover.Popup className="w-[min(320px,calc(100vw-2.5rem))] origin-[var(--transform-origin)] overflow-hidden rounded-xl border border-border/50 bg-surface-1 text-ink shadow-[0_4px_16px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.04)] transition-[transform,opacity] duration-200 ease-out data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0">
              <div className="flex items-center gap-3 border-b border-border/60 px-4 py-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
                  <ChatCircleDotsIcon size={20} weight="fill" />
                </div>
                <div className="min-w-0 flex-1">
                  <Popover.Title className="text-sm font-semibold text-ink text-balance">
                    Hỗ trợ trực tuyến
                  </Popover.Title>
                  <Popover.Description className="flex items-center gap-1.5 text-xs text-ink-muted text-pretty">
                    <span className="h-1.5 w-1.5 rounded-full bg-success" />
                    Chọn kênh liên hệ bạn muốn
                  </Popover.Description>
                </div>
              </div>
              <div className="p-2">
                {CHANNELS.map((channel) => {
                  const Icon = channel.icon;
                  return (
                    <a
                      key={channel.id}
                      href={channel.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/ch flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors duration-150 hover:bg-white/5 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white"
                    >
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${channel.accent} text-white shadow-[0_2px_8px_rgba(0,0,0,0.3)]`}
                      >
                        <Icon size={20} weight="fill" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-ink text-pretty">
                          {channel.label}
                        </p>
                        <p className="text-xs text-ink-muted text-pretty">
                          {channel.description}
                        </p>
                      </div>
                      <ArrowUpRightIcon
                        size={16}
                        weight="bold"
                        className="shrink-0 text-ink-muted transition-[color,transform] duration-150 group-hover/ch:text-ink group-hover/ch:translate-x-0.5 group-hover/ch:-translate-y-0.5"
                      />
                    </a>
                  );
                })}
              </div>
              <div className="border-t border-border/60 bg-canvas/40 px-4 py-2.5 text-[11px] text-ink-muted text-pretty">
                Tư vấn & đặt hàng nhanh chóng qua tin nhắn
              </div>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
};

export default ChatSupport;
