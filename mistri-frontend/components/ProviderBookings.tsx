"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { fetchProviderBookings, transitionBooking, Booking } from "@/lib/api";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { toneForStatus } from "@/lib/status";

export default function ProviderBookings({ accessToken }: { accessToken: string }) {
  const t = useTranslations("provider");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProviderBookings(accessToken).then(setBookings).finally(() => setLoading(false));
  }, [accessToken]);

  async function handleTransition(id: number, action: "confirm" | "decline" | "complete") {
    const updated = await transitionBooking(accessToken, id, action);
    setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
  }

  if (loading) return <p className="text-sm text-muted">{t("loading")}</p>;

  return (
    <div>
      <h2 className="mb-3 font-display font-bold text-ink">{t("myJobs")}</h2>
      {bookings.length === 0 ? (
        <p className="text-sm text-muted">{t("noJobs")}</p>
      ) : (
        <div className="space-y-2">
          {bookings.map((b) => (
            <div key={b.id} className="rounded-md border border-line bg-white p-3 text-sm">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <p className="font-medium text-ink">{b.service_title}</p>
                  <p className="text-muted">
                    {b.customer_username} · {new Date(b.start_time).toLocaleString()}
                  </p>
                </div>
                <Badge tone={toneForStatus(b.status)}>{b.status}</Badge>
              </div>
              {b.status === "requested" && (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleTransition(b.id, "confirm")}>
                    {t("confirm")}
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleTransition(b.id, "decline")}>
                    {t("decline")}
                  </Button>
                </div>
              )}
              {b.status === "confirmed" && (
                <Button size="sm" onClick={() => handleTransition(b.id, "complete")}>
                  {t("complete")}
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}