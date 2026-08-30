"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/useAuth";
import LanguageSwitcher from "./LanguageSwitcher";
import NotificationBell from "./NotificationBell";
import { MenuIcon, CloseIcon } from "@/components/ui/icons";

export default function Navbar() {
  const { user, accessToken, logout, loading } = useAuth();
  const t = useTranslations("nav");
  const [menuOpen, setMenuOpen] = useState(false);

  const isLoggedIn = !loading && !!user && !!accessToken;

  function closeMenu() {
    setMenuOpen(false);
  }

  function handleLogout() {
    closeMenu();
    logout();
  }

  return (
    <nav className="border-b border-line">
      <div className="flex items-center justify-between px-6 py-3">
        <Link href="/" onClick={closeMenu} className="font-display font-bold text-xl tracking-wide text-ink">
          {t("brand").toUpperCase()}
        </Link>

        <div className="flex items-center gap-3">
          {/* Desktop links — hidden below md */}
          <div className="hidden items-center gap-4 text-sm text-ink md:flex">
            <Link href="/services" className="hover:text-brick transition-colors">
              {t("services")}
            </Link>
            <Link href="/providers/nearby" className="hover:text-brick transition-colors">
              {t("nearby")}
            </Link>
            {isLoggedIn && (
              <Link href="/dashboard" className="hover:text-brick transition-colors">
                {t("dashboard")}
              </Link>
            )}
            {!loading && !isLoggedIn && (
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
            {isLoggedIn && (
              <button
                onClick={logout}
                className="rounded bg-ink px-3 py-1.5 text-chalk hover:bg-ink/90 transition-colors"
              >
                {t("logout")}
              </button>
            )}
            <LanguageSwitcher />
          </div>

          {/* Bell: mounted once, visible at every breakpoint */}
          {isLoggedIn && <NotificationBell accessToken={accessToken} />}

          {/* Hamburger — hidden at md and above */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? t("closeMenu") : t("openMenu")}
            aria-expanded={menuOpen}
            className="flex h-9 w-9 items-center justify-center rounded text-ink md:hidden"
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {menuOpen && (
        <div className="flex flex-col gap-3 border-t border-line px-6 py-4 text-sm text-ink md:hidden">
          <Link href="/services" onClick={closeMenu} className="py-1">
            {t("services")}
          </Link>
          <Link href="/providers/nearby" onClick={closeMenu} className="py-1">
            {t("nearby")}
          </Link>

          {isLoggedIn && (
            <>
              <Link href="/dashboard" onClick={closeMenu} className="py-1">
                {t("dashboard")}
              </Link>
              <button onClick={handleLogout} className="w-fit rounded bg-ink px-3 py-1.5 text-chalk">
                {t("logout")}
              </button>
            </>
          )}

          {!loading && !isLoggedIn && (
            <>
              <Link href="/login" onClick={closeMenu} className="py-1">
                {t("login")}
              </Link>
              <Link href="/register" onClick={closeMenu} className="w-fit rounded bg-brick px-3 py-1.5 text-chalk">
                {t("signup")}
              </Link>
            </>
          )}

          <div className="pt-1">
            <LanguageSwitcher />
          </div>
        </div>
      )}
    </nav>
  );
}