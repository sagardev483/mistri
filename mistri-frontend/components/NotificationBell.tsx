"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useNotifications } from "@/hooks/useNotifications";
import { BellIcon } from "@/components/ui/icons";

export default function NotificationBell({ accessToken }: { accessToken: string }) {
  const t = useTranslations("notifications");
  const { notifications, unreadCount, loading, markRead } = useNotifications(accessToken);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-8 w-8 items-center justify-center rounded text-ink transition-colors hover:text-brick"
        aria-label={t("title")}
      >
        <BellIcon className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brick px-1 text-[10px] font-semibold text-chalk">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-md border border-line bg-white shadow-lg">
          <div className="border-b border-line px-4 py-2">
            <p className="font-display font-bold text-ink">{t("title")}</p>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <p className="px-4 py-4 text-sm text-muted">{t("loading")}</p>
            ) : notifications.length === 0 ? (
              <p className="px-4 py-4 text-sm text-muted">{t("empty")}</p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => !n.is_read && markRead(n.id)}
                  className={`block w-full border-b border-line px-4 py-3 text-left text-sm transition-colors last:border-b-0 hover:bg-chalk ${
                    n.is_read ? "" : "bg-brass-bg/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className={`font-medium ${n.is_read ? "text-muted" : "text-ink"}`}>{n.title}</p>
                    {!n.is_read && <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brick" />}
                  </div>
                  <p className="mt-0.5 text-xs text-muted">{n.message}</p>
                  <p className="mt-1 text-[10px] text-faint">{new Date(n.created_at).toLocaleString()}</p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}