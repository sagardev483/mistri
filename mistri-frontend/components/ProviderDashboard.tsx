"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  fetchMyProviderProfile,
  createProviderProfile,
  submitProviderForReview,
  ProviderProfile,
  User,
} from "@/lib/api";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import ManageServices from "@/components/ManageServices";
import ProviderBookings from "@/components/ProviderBookings";
import ProviderLocationCard from "@/components/ProviderLocationCard";

export default function ProviderDashboard({ user, accessToken }: { user: User; accessToken: string }) {
  const t = useTranslations("provider");
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [businessName, setBusinessName] = useState("");
  const [bio, setBio] = useState("");
  const [years, setYears] = useState("0");

  useEffect(() => {
    fetchMyProviderProfile(accessToken)
      .then(setProfile)
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load profile"))
      .finally(() => setLoading(false));
  }, [accessToken]);

  async function handleCreateProfile(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const created = await createProviderProfile(accessToken, {
        business_name: businessName,
        bio,
        years_experience: Number(years),
      });
      setProfile(created);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create profile");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmitForReview() {
    setSubmitting(true);
    setError(null);
    try {
      const updated = await submitProviderForReview(accessToken);
      setProfile(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit for review");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl flex-1 p-8">
        <p className="text-sm text-muted">{t("loading")}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl flex-1 p-8">
      <h1 className="mb-1 font-display text-xl font-bold text-ink">{t("title")}</h1>
      <p className="mb-6 text-sm text-muted">{user.username}</p>

      {error && <p className="mb-4 text-sm text-brick">{error}</p>}

      {!profile && (
        <div className="rounded-md border border-line bg-white p-5">
          <p className="mb-1 font-display font-bold text-ink">{t("noProfileTitle")}</p>
          <p className="mb-4 text-sm text-muted">{t("noProfileBody")}</p>
          <form onSubmit={handleCreateProfile} className="space-y-3">
            <input
              placeholder={t("businessName")}
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full rounded border border-line px-3 py-2 text-sm text-ink placeholder:text-faint focus:border-brick focus:outline-none"
              required
            />
            <textarea
              placeholder={t("bio")}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full rounded border border-line px-3 py-2 text-sm text-ink placeholder:text-faint focus:border-brick focus:outline-none"
              rows={3}
            />
            <input
              placeholder={t("yearsExperience")}
              type="number"
              value={years}
              onChange={(e) => setYears(e.target.value)}
              className="w-full rounded border border-line px-3 py-2 text-sm text-ink placeholder:text-faint focus:border-brick focus:outline-none"
            />
            <Button type="submit" disabled={submitting} size="sm">
              {submitting ? t("creating") : t("createProfile")}
            </Button>
          </form>
        </div>
      )}

      {profile && (
        <div className="mb-4">
          <ProviderLocationCard accessToken={accessToken} hasLocation={profile.has_location} onUpdated={setProfile} />
        </div>
      )}

      {profile?.verification_status === "pending" && (
        <div className="rounded-md border border-line bg-white p-5">
          <div className="mb-2 flex items-center gap-2">
            <p className="font-display font-bold text-ink">{t("pendingTitle")}</p>
            <Badge tone="brass">{profile.verification_status}</Badge>
          </div>
          <p className="mb-4 text-sm text-muted">{t("pendingBody")}</p>
          <Button size="sm" onClick={handleSubmitForReview} disabled={submitting}>
            {submitting ? t("submitting") : t("submitForReview")}
          </Button>
        </div>
      )}

      {profile?.verification_status === "under_review" && (
        <div className="rounded-md border border-line bg-white p-5">
          <div className="mb-2 flex items-center gap-2">
            <p className="font-display font-bold text-ink">{t("underReviewTitle")}</p>
            <Badge tone="brass">{profile.verification_status}</Badge>
          </div>
          <p className="text-sm text-muted">{t("underReviewBody")}</p>
        </div>
      )}

      {profile?.verification_status === "rejected" && (
        <div className="rounded-md border border-line bg-white p-5">
          <div className="mb-2 flex items-center gap-2">
            <p className="font-display font-bold text-ink">{t("rejectedTitle")}</p>
            <Badge tone="danger">{profile.verification_status}</Badge>
          </div>
          <p className="text-sm text-muted">{t("rejectedBody")}</p>
        </div>
      )}

      {profile?.verification_status === "suspended" && (
        <div className="rounded-md border border-line bg-white p-5">
          <div className="mb-2 flex items-center gap-2">
            <p className="font-display font-bold text-ink">{t("suspendedTitle")}</p>
            <Badge tone="danger">{profile.verification_status}</Badge>
          </div>
          <p className="text-sm text-muted">{t("suspendedBody")}</p>
        </div>
      )}

      {profile?.verification_status === "verified" && (
        <div className="space-y-8">
          <div className="flex items-center gap-2">
            <p className="font-display font-bold text-ink">{profile.business_name}</p>
            <Badge tone="verified" stamp>
              {t("verifiedTitle")}
            </Badge>
          </div>
          <ManageServices accessToken={accessToken} />
          <ProviderBookings accessToken={accessToken} />
        </div>
      )}
    </div>
  );
}