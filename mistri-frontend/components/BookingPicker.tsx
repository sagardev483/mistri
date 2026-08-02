"use client";

import { useMemo, useState } from "react";

interface BookingPickerProps {
  durationMinutes: number;
  onConfirm: (start: Date, end: Date) => void;
  confirmLabel?: string;
}

const BUSINESS_START_HOUR = 9;
const BUSINESS_END_HOUR = 18;
const DAYS_AHEAD = 14;

function buildDateOptions(): Date[] {
  const dates: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < DAYS_AHEAD; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    dates.push(d);
  }
  return dates;
}

function buildTimeSlots(date: Date, durationMinutes: number): Date[] {
  const slots: Date[] = [];
  const cursor = new Date(date);
  cursor.setHours(BUSINESS_START_HOUR, 0, 0, 0);

  const dayEnd = new Date(date);
  dayEnd.setHours(BUSINESS_END_HOUR, 0, 0, 0);

  const now = new Date();

  while (cursor.getTime() + durationMinutes * 60000 <= dayEnd.getTime()) {
    if (cursor > now) {
      slots.push(new Date(cursor));
    }
    cursor.setMinutes(cursor.getMinutes() + durationMinutes);
  }
  return slots;
}

export default function BookingPicker({
  durationMinutes,
  onConfirm,
  confirmLabel = "Confirm booking",
}: BookingPickerProps) {
  const dateOptions = useMemo(() => buildDateOptions(), []);
  const [selectedDate, setSelectedDate] = useState<Date>(dateOptions[0]);
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);

  const timeSlots = useMemo(
    () => buildTimeSlots(selectedDate, durationMinutes),
    [selectedDate, durationMinutes]
  );

  function handlePickDate(date: Date) {
    setSelectedDate(date);
    setSelectedSlot(null);
  }

  function handleConfirm() {
    if (!selectedSlot) return;
    const end = new Date(selectedSlot.getTime() + durationMinutes * 60000);
    onConfirm(selectedSlot, end);
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {dateOptions.map((date) => {
          const isSelected = date.toDateString() === selectedDate.toDateString();
          return (
            <button
              key={date.toISOString()}
              onClick={() => handlePickDate(date)}
              className={`flex min-w-[3.25rem] flex-col items-center rounded border px-2 py-2 text-xs transition-colors ${
                isSelected
                  ? "border-black bg-black text-white"
                  : "border-zinc-300 text-zinc-700 hover:border-zinc-500"
              }`}
            >
              <span className="uppercase tracking-wide">
                {date.toLocaleDateString(undefined, { weekday: "short" })}
              </span>
              <span className="mt-0.5 text-sm font-semibold">{date.getDate()}</span>
            </button>
          );
        })}
      </div>

      {timeSlots.length === 0 ? (
        <p className="text-sm text-zinc-500">
          No slots left today — try another date.
        </p>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {timeSlots.map((slot) => {
            const isSelected = selectedSlot?.getTime() === slot.getTime();
            return (
              <button
                key={slot.toISOString()}
                onClick={() => setSelectedSlot(slot)}
                className={`rounded border px-2 py-1.5 text-sm transition-colors ${
                  isSelected
                    ? "border-black bg-black text-white"
                    : "border-zinc-300 text-zinc-700 hover:border-zinc-500"
                }`}
              >
                {slot.toLocaleTimeString(undefined, {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </button>
            );
          })}
        </div>
      )}

      {selectedSlot && (
        <div className="flex items-center justify-between border-t pt-3">
          <p className="text-sm text-zinc-600">
            {selectedDate.toLocaleDateString(undefined, {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}{" "}
            at{" "}
            {selectedSlot.toLocaleTimeString(undefined, {
              hour: "numeric",
              minute: "2-digit",
            })}{" "}
            ({durationMinutes} min)
          </p>
          <button
            onClick={handleConfirm}
            className="rounded bg-black px-4 py-1.5 text-sm text-white"
          >
            {confirmLabel}
          </button>
        </div>
      )}
    </div>
  );
}