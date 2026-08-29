"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createReview } from "@/lib/api";
import Button from "@/components/ui/Button";
import StarRating from "@/components/ui/StarRating";

interface ReviewFormProps {
  accessToken: string;
  bookingId: number;
  onSubmitted: () => void;
}

export default function ReviewForm({ accessToken, bookingId, onSubmitted }: ReviewFormProps) {
  const t = useTranslations("reviews");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await createReview(accessToken, { booking: bookingId, rating, comment });
      onSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit review");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-2 border-t border-line pt-3">
      <p className="text-xs font-medium text-muted">{t("rateYourExperience")}</p>
      <StarRating value={rating} onChange={setRating} />
      <textarea
        placeholder={t("commentPlaceholder")}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
        className="w-full rounded border border-line px-3 py-2 text-sm text-ink placeholder:text-faint focus:border-brick focus:outline-none"
      />
      {error && <p className="text-xs text-brick">{error}</p>}
      <Button type="submit" size="sm" disabled={submitting}>
        {submitting ? t("submitting") : t("submitReview")}
      </Button>
    </form>
  );
}