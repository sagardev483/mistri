"use client";

import { cn } from "@/lib/cn";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: "sm" | "md";
}

export default function StarRating({ value, onChange, readOnly = false, size = "md" }: StarRatingProps) {
  const stars = [1, 2, 3, 4, 5];
  const starSize = size === "sm" ? "text-sm" : "text-xl";

  return (
    <div className="flex gap-0.5">
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(star)}
          className={cn(
            starSize,
            "leading-none transition-colors",
            readOnly ? "cursor-default" : "cursor-pointer hover:scale-110",
            star <= value ? "text-brass" : "text-line"
          )}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}