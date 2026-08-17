"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/useAuth";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const t = useTranslations("nav");

  return (
    <nav className="flex items-center justify-between border-b border-line px-6 py-3">
      <Link href="/" className="font-display font-bold text-xl tracking-wide text-ink">
        {t("brand").toUpperCase()}
      </Link>

      <div className="flex items-center gap-4 text-sm text-ink">
        <Link href="/services" className="hover:text-brick transition-colors">
          {t("services")}
        </Link>

        {loading ? null : user ? (
          <>
            <Link href="/dashboard" className="hover:text-brick transition-colors">
              {t("dashboard")}
            </Link>
            <button
              onClick={logout}
              className="rounded bg-ink px-3 py-1.5 text-chalk hover:bg-ink/90 transition-colors"
            >
              {t("logout")}
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="hover:text-brick transition-colors">
              {t("login")}
            </Link>
            <Link
              href="/register"
              className="rounded bg-brick px-3 py-1.5 text-chalk hover:bg-brick-dark transition-colors"
            >
              {t("signup")}
            </Link>
          </>
        )}

        <LanguageSwitcher />
      </div>
    </nav>
  );
}