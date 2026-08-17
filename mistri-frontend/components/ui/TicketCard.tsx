import { ReactNode } from "react";
import { cn } from "@/lib/cn";
import Badge from "./Badge";

interface TicketCardMeta {
  icon: ReactNode;
  label: string;
}

interface TicketCardProps {
  refNumber: string;
  verifiedLabel?: string;
  title: string;
  subtitle: string;
  meta?: TicketCardMeta[];
  price?: string;
  action?: ReactNode;
  className?: string;
}

export default function TicketCard({
  refNumber,
  verifiedLabel,
  title,
  subtitle,
  meta = [],
  price,
  action,
  className,
}: TicketCardProps) {
  return (
    <div
      className={cn(
        "rounded-md border border-line bg-white p-3.5 transition-transform hover:-translate-y-0.5",
        className
      )}
    >
      <div className="mb-2 flex items-start justify-between">
        <span className="font-mono text-[11px] text-faint">{refNumber}</span>
        {verifiedLabel && (
          <Badge tone="verified" stamp>
            {verifiedLabel}
          </Badge>
        )}
      </div>

      <p className="font-display text-lg font-bold text-ink">{title}</p>
      <p className="mb-2.5 text-xs text-muted">{subtitle}</p>

      {meta.length > 0 && (
        <div className="mb-3 flex gap-3 text-[11px] text-faint">
          {meta.map((m, i) => (
            <span key={i} className="flex items-center gap-1">
              {m.icon}
              {m.label}
            </span>
          ))}
        </div>
      )}

      {(price || action) && (
        <div className="flex items-center justify-between border-t border-line pt-2.5">
          {price ? <span className="font-display text-base font-bold text-ink">{price}</span> : <span />}
          {action}
        </div>
      )}
    </div>
  );
}