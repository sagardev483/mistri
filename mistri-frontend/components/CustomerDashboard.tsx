"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { fetchMyBookings, Booking, User } from "@/lib/api";
import Badge from "@/components/ui/Badge";
import { toneForStatus } from "@/lib/status";
import Link from "next/link";

export default function CustomerDashboard({ user, accessToken }: { user: User; accessToken: string }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useTranslations("dashboard");

  useEffect(() => {
    fetchMyBookings(accessToken).then(setBookings).finally(() => setLoading(false));
  }, [accessToken]);

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
        <div className="space-y-2">
          {bookings.map((b) => (
            <div key={b.id} className="flex items-center justify-between rounded-md border border-line bg-white p-3 text-sm">
              <div>
                <p className="font-medium text-ink">{b.service_title}</p>
                <p className="text-muted">{new Date(b.start_time).toLocaleString()}</p>
              </div>
              <Badge tone={toneForStatus(b.status)}>{b.status}</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}