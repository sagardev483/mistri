"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/useAuth";
import { fetchMyBookings, Booking } from "@/lib/api";
import Link from "next/link";

export default function DashboardPage() {
  const { user, accessToken, logout, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    fetchMyBookings(accessToken)
      .then(setBookings)
      .finally(() => setBookingsLoading(false));
  }, [accessToken]);

  if (authLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-zinc-600">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p>You&apos;re not logged in. <Link href="/login" className="underline">Log in</Link></p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl flex-1 p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Welcome, {user.username}</h1>
          <p className="text-sm text-zinc-600">Account type: {user.user_type}</p>
        </div>
        <button onClick={logout} className="rounded bg-zinc-800 px-4 py-2 text-sm text-white">
          Log out
        </button>
      </div>

      <h2 className="mb-3 font-medium">My Bookings</h2>
      {bookingsLoading ? (
        <p className="text-sm text-zinc-600">Loading...</p>
      ) : bookings.length === 0 ? (
        <p className="text-sm text-zinc-600">
          No bookings yet. <Link href="/services" className="underline">Browse services</Link>
        </p>
      ) : (
        <div className="space-y-2">
          {bookings.map((b) => (
            <div key={b.id} className="rounded border p-3 text-sm">
              <p className="font-medium">{b.service_title}</p>
              <p className="text-zinc-600">
                {new Date(b.start_time).toLocaleString()} • status: {b.status}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}