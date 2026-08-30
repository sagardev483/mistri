"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/useAuth";
import { fetchServices, createBooking, Service } from "@/lib/api";
import BookingPicker from "@/components/BookingPicker";
import Button from "@/components/ui/Button";
import TicketCard from "@/components/ui/TicketCard";
import { ClockIcon } from "@/components/ui/icons";
import Link from "next/link";

function ServicesContent() {
  const searchParams = useSearchParams();
  const providerId = searchParams.get("provider");

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingServiceId, setBookingServiceId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { accessToken, user } = useAuth();
  const t = useTranslations("services");

  useEffect(() => {
    setLoading(true);
    fetchServices(providerId ?? undefined)
      .then(setServices)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [providerId]);

  async function handleBook(service: Service, start: Date, end: Date) {
    if (!accessToken) {
      setMessage("Please log in to book a service.");
      return;
    }
    setMessage(null);
    try {
      await createBooking(accessToken, { service: service.id, start_time: start.toISOString(), end_time: end.toISOString() });
      setMessage(`Booked "${service.title}" for ${start.toLocaleString()}`);
      setBookingServiceId(null);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Booking failed");
    }
  }

  if (loading) return <p className="p-8 text-muted">{t("loading")}</p>;
  if (error) return <p className="p-8 text-brick">{error}</p>;

  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="mb-6 font-display text-2xl font-bold text-ink">{t("title")}</h1>

      {providerId && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-md border border-line bg-white px-4 py-2 text-sm">
          <span className="text-muted">{t("filteredByProvider")}</span>
          <Link href="/services" className="text-brick hover:underline">
            {t("clearFilter")}
          </Link>
        </div>
      )}

      {!user && (
        <p className="mb-4 text-sm text-muted">
          <Link href="/login" className="text-brick hover:underline">
            {t("loginPromptLink")}
          </Link>{" "}
          {t("loginPromptSuffix")}
        </p>
      )}

      {message && <p className="mb-4 text-sm text-verified">{message}</p>}

      <div className="space-y-4">
        {services.map((service) => (
          <div key={service.id}>
            <TicketCard
              refNumber={`#SV-${String(service.id).padStart(4, "0")}`}
              title={service.title}
              subtitle={`${service.category.name} · ${service.provider_name}`}
              meta={[{ icon: <ClockIcon />, label: `${service.duration_minutes} min` }]}
              price={`Rs ${service.base_price}`}
              action={
                <Button
                  size="sm"
                  onClick={() => setBookingServiceId(bookingServiceId === service.id ? null : service.id)}
                >
                  {bookingServiceId === service.id ? t("cancel") : t("book")}
                </Button>
              }
            />
            {bookingServiceId === service.id && (
              <div className="mt-3 rounded-md border border-line bg-white p-4">
                <BookingPicker
                  durationMinutes={service.duration_minutes}
                  onConfirm={(start, end) => handleBook(service, start, end)}
                  confirmLabel={t("confirmBooking")}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<p className="p-8 text-muted">Loading...</p>}>
      <ServicesContent />
    </Suspense>
  );
}