"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/useAuth";
import { fetchServices, createBooking, Service } from "@/lib/api";
import BookingPicker from "@/components/BookingPicker";
import Button from "@/components/ui/Button";
import TicketCard from "@/components/ui/TicketCard";
import { ClockIcon, MapPinIcon } from "@/components/ui/icons";
import Link from "next/link";

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingServiceId, setBookingServiceId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { accessToken, user } = useAuth();
  const t = useTranslations("services");

  useEffect(() => {
    fetchServices().then(setServices).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, []);

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

      {!user && (
        <p className="mb-4 text-sm text-muted">
          <Link href="/login" className="text-brick hover:underline">{t("loginPromptLink")}</Link> {t("loginPromptSuffix")}
        </p>
      )}

      {message && <p className="mb-4 text-sm text-verified">{message}</p>}

      <div className="space-y-4">
        {services.map((service) => (
          <TicketCard
            key={service.id}
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
                {t("book")}
              </Button>
            }
          >
          </TicketCard>
        ))}
      </div>

      {services.map((service) =>
        bookingServiceId === service.id ? (
          <div key={`picker-${service.id}`} className="mt-3 rounded-md border border-line bg-white p-4">
            <BookingPicker
              durationMinutes={service.duration_minutes}
              onConfirm={(start, end) => handleBook(service, start, end)}
              confirmLabel={t("confirmBooking")}
            />
          </div>
        ) : null
      )}
    </div>
  );
}