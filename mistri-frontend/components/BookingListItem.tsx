"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Booking, Payment, capturePayment } from "@/lib/api";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import ReviewForm from "@/components/ReviewForm";
import { toneForStatus } from "@/lib/status";

interface BookingListItemProps {
  booking: Booking;
  payment: Payment | null;
  accessToken: string;
  onPaymentUpdated: (payment: Payment) => void;
  onReviewSubmitted: () => void;
}

export default function BookingListItem({
  booking,
  payment,
  accessToken,
  onPaymentUpdated,
  onReviewSubmitted,
}: BookingListItemProps) {
  const t = useTranslations("dashboard");
  const tr = useTranslations("reviews");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [captureError, setCaptureError] = useState<string | null>(null);

  async function handlePay() {
    if (!payment) return;
    setCapturing(true);
    setCaptureError(null);
    try {
      const updated = await capturePayment(accessToken, payment.id);
      onPaymentUpdated(updated);
    } catch (err) {
      setCaptureError(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setCapturing(false);
    }
  }

  const needsPayment = payment && payment.status !== "captured" && payment.status !== "refunded";
  const canReview = booking.status === "completed" && !booking.has_review;

  return (
    <div className="rounded-md border border-line bg-white p-3 text-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-ink">{booking.service_title}</p>
          <p className="text-muted">{new Date(booking.start_time).toLocaleString()}</p>
        </div>
        <Badge tone={toneForStatus(booking.status)}>{booking.status}</Badge>
      </div>

      {payment && (
        <div className="mt-2 flex items-center justify-between border-t border-line pt-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">{t("payment")}</span>
            <Badge tone={toneForStatus(payment.status)}>{payment.status}</Badge>
            <span className="text-xs text-faint">Rs {payment.amount}</span>
          </div>
          {needsPayment && (
            <Button size="sm" onClick={handlePay} disabled={capturing}>
              {capturing ? t("paying") : t("payNow")}
            </Button>
          )}
        </div>
      )}
      {captureError && <p className="mt-1 text-xs text-brick">{captureError}</p>}

      {canReview && !showReviewForm && (
        <div className="mt-2 border-t border-line pt-2">
          <Button size="sm" variant="ghost" onClick={() => setShowReviewForm(true)}>
            {tr("leaveReview")}
          </Button>
        </div>
      )}
      {canReview && showReviewForm && (
        <ReviewForm
          accessToken={accessToken}
          bookingId={booking.id}
          onSubmitted={() => {
            setShowReviewForm(false);
            onReviewSubmitted();
          }}
        />
      )}
      {booking.status === "completed" && booking.has_review && (
        <p className="mt-2 border-t border-line pt-2 text-xs text-verified">{tr("reviewSubmitted")}</p>
      )}
    </div>
  );
}