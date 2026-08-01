"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/useAuth";
import { fetchServices, createBooking, Service } from "@/lib/api";
import BookingPicker from "@/components/BookingPicker";
import Link from "next/link";

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingServiceId, setBookingServiceId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { accessToken, user } = useAuth();

  useEffect(() => {
    fetchServices()
      .then(setServices)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleBook(service: Service, start: Date, end: Date) {
    if (!accessToken) {
      setMessage("Please log in to book a service.");
      return;
    }
    setMessage(null);
    try {
      await createBooking(accessToken, {
        service: service.id,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
      });
      setMessage(`Booked "${service.title}" for ${start.toLocaleString()}`);
      setBookingServiceId(null);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Booking failed");
    }
  }

  if (loading) return <p className="p-8">Loading services...</p>;
  if (error) return <p className="p-8 text-red-600">{error}</p>;

  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="mb-6 text-2xl font-semibold">Available Services</h1>

      {!user && (
        <p className="mb-4 text-sm text-zinc-600">
          <Link href="/login">Log in</Link>to book a service.
        </p>
      )}

      {message && <p className="mb-4 text-sm text-blue-700">{message}</p>}

      <div className="space-y-4">
        {services.map((service) => (
          <div key={service.id} className="rounded border p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-medium">{service.title}</h2>
                <p className="text-sm text-zinc-600">
                  {service.category.name} • {service.provider_name} • {service.duration_minutes} min
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">Rs {service.base_price}</p>
                <button
                  onClick={() =>
                    setBookingServiceId(bookingServiceId === service.id ? null : service.id)
                  }
                  className="mt-1 rounded bg-black px-3 py-1 text-sm text-white"
                >
                  Book
                </button>
              </div>
            </div>

            {bookingServiceId === service.id && (
              <div className="mt-3 border-t pt-3">
                <BookingPicker
                  durationMinutes={service.duration_minutes}
                  onConfirm={(start, end) => handleBook(service, start, end)}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}