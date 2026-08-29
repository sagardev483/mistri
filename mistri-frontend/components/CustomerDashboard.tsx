"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { fetchMyBookings, fetchMyPayments, Booking, Payment, User } from "@/lib/api";
import BookingListItem from "@/components/BookingListItem";
import Link from "next/link";

export default function CustomerDashboard({ user, accessToken }: { user: User; accessToken: string }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useTranslations("dashboard");

  useEffect(() => {
    Promise.all([fetchMyBookings(accessToken), fetchMyPayments(accessToken)])
      .then(([b, p]) => {
        setBookings(b);
        setPayments(p);
      })
      .finally(() => setLoading(false));
  }, [accessToken]);

  function handlePaymentUpdated(updated: Payment) {
    setPayments((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }

  function handleReviewSubmitted(bookingId: number) {
    setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, has_review: true } : b)));
  }

  return (
    <div className="mx-auto max-w-2xl flex-1 p-8">
      <h1 className="mb-1 font-display text-xl font-bold text-ink">{t("welcome", { name: user.username })}</h1>
      <p className="mb-6 text-sm text-muted">{t("accountType", { type: t("typeCustomer") })}</p>

      <h2 className="mb-3 font-display font-bold text-ink">{t("myBookings")}</h2>
      {loading ? (
        <p className="text-sm text-muted">{t("loading")}</p>
      ) : bookings.length === 0 ? (
        <p className="text-sm text-muted">
          {t("noBookings")}{" "}
          <Link href="/services" className="text-brick underline">
            {t("browseServices")}
          </Link>
        </p>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <BookingListItem
              key={b.id}
              booking={b}
              payment={payments.find((p) => p.booking === b.id) ?? null}
              accessToken={accessToken}
              onPaymentUpdated={handlePaymentUpdated}
              onReviewSubmitted={() => handleReviewSubmitted(b.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}