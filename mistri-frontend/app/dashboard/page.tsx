"use client";

import { useTranslations } from "next-intl";
import { useAuth } from "@/context/useAuth";
import CustomerDashboard from "@/components/CustomerDashboard";
import ProviderDashboard from "@/components/ProviderDashboard";
import Link from "next/link";

export default function DashboardPage() {
  const { user, accessToken, loading } = useAuth();
  const t = useTranslations("dashboard");

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-muted">{t("loading")}</p>
      </div>
    );
  }

  if (!user || !accessToken) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-ink">
          {t("notLoggedIn")}{" "}
          <Link href="/login" className="text-brick underline">
            {t("loginLink")}
          </Link>
        </p>
      </div>
    );
  }

  return user.user_type === "provider" ? (
    <ProviderDashboard user={user} accessToken={accessToken} />
  ) : (
    <CustomerDashboard user={user} accessToken={accessToken} />
  );
}