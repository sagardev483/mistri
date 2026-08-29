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
    <div className="flex overflow-hidden rounded border border-line text-xs">
      <button
        data-testid="locale-en"
        onClick={() => switchTo("en")}
        className={`px-2 py-1 ${locale === "en" ? "bg-ink text-chalk" : "text-muted"}`}
      >
        {"English"}
      </button>
      <button
        data-testid="locale-ne"
        onClick={() => switchTo("ne")}
        className={`px-2 py-1 ${locale === "ne" ? "bg-ink text-chalk" : "text-muted"}`}
      >
        {"\u0928\u0947\u092A\u093E\u0932\u0940"}
      </button>
    </div>
  );
}