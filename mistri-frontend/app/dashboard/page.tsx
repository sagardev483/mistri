"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/useAuth";
import { fetchMyBookings, Booking } from "@/lib/api";
import Link from "next/link";

export default function DashboardPage() {
  const { user, accessToken, logout, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const t = useTranslations("dashboard");

  useEffect(() => {
    if (!accessToken) return;
    fetchMyBookings(accessToken).then(setBookings).finally(() => setBookingsLoading(false));
  }, [accessToken]);

  if (authLoading) {
    return <div className="flex flex-1 items-center justify-center"><p className="text-sm text-zinc-600">{t("loading")}</p></div>;
  }

  if (!user) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p>{t("notLoggedIn")} <Link href="/login" className="underline">{t("loginLink")}</Link></p>
      </div>
    );
  }

  const typeLabel = user.user_type === "provider" ? t("typeProvider") : t("typeCustomer");

  return (
    <div className="mx-auto max-w-2xl flex-1 p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">{t("welcome", { name: user.username })}</h1>
          <p className="text-sm text-zinc-600">{t("accountType", { type: typeLabel })}</p>
        </div>
        <button onClick={logout} className="rounded bg-zinc-800 px-4 py-2 text-sm text-white">
          {t("logout")}
        </button>
      </div>

      <h2 className="mb-3 font-medium">{t("myBookings")}</h2>
      {bookingsLoading ? (
        <p className="text-sm text-zinc-600">{t("loading")}</p>
      ) : bookings.length === 0 ? (
        <p className="text-sm text-zinc-600">
          {t("noBookings")} <Link href="/services" className="underline">{t("browseServices")}</Link>
        </p>
      ) : (
        <div className="space-y-2">
          {bookings.map((b) => (
            <div key={b.id} className="rounded border p-3 text-sm">
              <p className="font-medium">{b.service_title}</p>
              <p className="text-zinc-600">{new Date(b.start_time).toLocaleString()} • status: {b.status}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}