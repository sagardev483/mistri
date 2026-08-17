import { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type BadgeTone = "verified" | "brass" | "neutral" | "danger";

const TONE_CLASSES: Record<BadgeTone, string> = {
  verified: "bg-verified-bg text-verified border-verified",
  brass: "bg-brass-bg text-brass-text border-brass",
  neutral: "bg-line/40 text-muted border-line",
  danger: "bg-brick/10 text-brick border-brick",
};

interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  stamp?: boolean;
  className?: string;
}

export default function Badge({ children, tone = "neutral", stamp = false, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        TONE_CLASSES[tone],
        stamp && "-rotate-6",
        className
      )}
    >
      {children}
    </span>
  );
}