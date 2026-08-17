"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/useAuth";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const t = useTranslations("nav");

  return (
    <nav className="flex items-center justify-between border-b px-6 py-3">
      <Link href="/" className="font-semibold">
        {t("brand")}
      </Link>

      <div className="flex items-center gap-4 text-sm">
        <Link href="/services" className="hover:underline">
          {t("services")}
        </Link>

        {loading ? null : user ? (
          <>
            <Link href="/dashboard" className="hover:underline">
              {t("dashboard")}
            </Link>
            <button onClick={logout} className="rounded bg-zinc-800 px-3 py-1.5 text-white">
              {t("logout")}
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="hover:underline">
              {t("login")}
            </Link>
            <Link href="/register" className="rounded bg-black px-3 py-1.5 text-white">
              {t("signup")}
            </Link>
          </>
        )}

        <LanguageSwitcher />
      </div>
    </nav>
  );
}