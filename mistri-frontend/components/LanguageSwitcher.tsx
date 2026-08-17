"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { LOCALE_COOKIE, type Locale } from "@/i18n/config";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();

  function switchTo(next: Locale) {
    if (next === locale) return;
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000`;
    router.refresh();
  }

  return (
    <div className="flex overflow-hidden rounded border text-xs">
      <button
        onClick={() => switchTo("en")}
        className={`px-2 py-1 ${locale === "en" ? "bg-black text-white" : "text-zinc-600"}`}
      >
        EN
      </button>
      <button
        onClick={() => switchTo("ne")}
        className={`px-2 py-1 ${locale === "ne" ? "bg-black text-white" : "text-zinc-600"}`}
      >
        ने
      </button>
    </div>
  );
}