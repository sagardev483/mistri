"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useGeolocation } from "@/hooks/useGeolocation";
import { updateProviderLocation, ProviderProfile } from "@/lib/api";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

interface ProviderLocationCardProps {
  accessToken: string;
  hasLocation: boolean;
  onUpdated: (profile: ProviderProfile) => void;
}

export default function ProviderLocationCard({ accessToken, hasLocation, onUpdated }: ProviderLocationCardProps) {
  const t = useTranslations("provider");
  const { coords, loading, error, request } = useGeolocation();

  useEffect(() => {
    if (!coords) return;
    updateProviderLocation(accessToken, coords.lat, coords.lng).then(onUpdated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords]);

  return (
    <div className="rounded-md border border-line bg-white p-4">
      <div className="mb-2 flex items-center gap-2">
        <p className="font-display font-bold text-ink">{t("locationTitle")}</p>
        <Badge tone={hasLocation ? "verified" : "brass"}>
          {hasLocation ? t("locationSet") : t("locationNotSet")}
        </Badge>
      </div>
      <p className="mb-3 text-sm text-muted">{t("locationBody")}</p>
      <Button size="sm" variant="ghost" onClick={request} disabled={loading}>
        {loading ? t("locating") : hasLocation ? t("updateLocation") : t("setLocation")}
      </Button>
      {error && <p className="mt-2 text-sm text-brick">{error}</p>}
    </div>
  );
}