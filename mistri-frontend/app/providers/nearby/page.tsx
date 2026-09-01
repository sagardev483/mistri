"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useGeolocation } from "@/hooks/useGeolocation";
import { fetchNearbyProviders, NearbyProvider } from "@/lib/api";
import TicketCard from "@/components/ui/TicketCard";
import Button from "@/components/ui/Button";
import { MapPinIcon } from "@/components/ui/icons";

const NearbyMap = dynamic(() => import("@/components/NearbyMap"), { ssr: false });

export default function NearbyProvidersPage() {
  const t = useTranslations("nearby");
  const { coords, loading: geoLoading, error: geoError, request } = useGeolocation();
  const [providers, setProviders] = useState<NearbyProvider[]>([]);
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [radiusKm, setRadiusKm] = useState(10);

  useEffect(() => {
    request();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // app/providers/nearby/page.tsx
useEffect(() => {
  if (!coords) return;
  // eslint-disable-next-line react-hooks/set-state-in-effect
  setFetching(true);
  setFetchError(null);
  fetchNearbyProviders(coords.lat, coords.lng, radiusKm)
    .then(setProviders)
    .catch((err) => setFetchError(err instanceof Error ? err.message : "Could not load nearby providers"))
    .finally(() => setFetching(false));
}, [coords, radiusKm]);

  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="mb-1 font-display text-2xl font-bold text-ink">{t("title")}</h1>
      <p className="mb-6 text-sm text-muted">{t("subtitle")}</p>

      {geoLoading && <p className="text-sm text-muted">{t("locating")}</p>}

      {geoError && (
        <div className="mb-4 rounded-md border border-brick/40 bg-brick/5 p-4 text-sm text-brick">
          {t("locationDenied")}
          <div className="mt-2">
            <Button size="sm" variant="ghost" onClick={request}>
              {t("retry")}
            </Button>
          </div>
        </div>
      )}

      {coords && (
        <>
          <div className="mb-4 flex items-center gap-3 text-sm">
            <label htmlFor="radius" className="text-muted">
              {t("radius")}
            </label>
            <select
              id="radius"
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="rounded border border-line px-2 py-1 text-ink focus:border-brick focus:outline-none"
            >
              <option value={5}>5 km</option>
              <option value={10}>10 km</option>
              <option value={25}>25 km</option>
              <option value={50}>50 km</option>
            </select>
          </div>

          <div className="mb-6">
            <NearbyMap center={coords} providers={providers} />
          </div>

          {fetching ? (
            <p className="text-sm text-muted">{t("loading")}</p>
          ) : fetchError ? (
            <p className="text-sm text-brick">{fetchError}</p>
          ) : providers.length === 0 ? (
            <p className="text-sm text-muted">{t("noResults")}</p>
          ) : (
            <div className="space-y-4">
              {providers.map((p) => (
                <TicketCard
                  key={p.id}
                  refNumber={`#PR-${String(p.id).padStart(4, "0")}`}
                  verifiedLabel={t("verifiedLabel")}
                  title={p.business_name || p.username}
                  subtitle={`${p.years_experience} ${t("yearsExperience")}`}
                  meta={p.distance_km != null ? [{ icon: <MapPinIcon />, label: `${p.distance_km} km` }] : []}
                  action={
                    <Link href={`/services?provider=${p.id}`}>
                      <Button size="sm">{t("viewServices")}</Button>
                    </Link>
                  }
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}