"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  fetchMyServices,
  fetchServiceCategories,
  createService,
  updateServiceActive,
  ManagedService,
  ServiceCategory,
} from "@/lib/api";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

export default function ManageServices({ accessToken }: { accessToken: string }) {
  const t = useTranslations("provider");
  const [services, setServices] = useState<ManagedService[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("60");
  const [categoryId, setCategoryId] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([fetchMyServices(accessToken), fetchServiceCategories()])
      .then(([svc, cats]) => {
        setServices(svc);
        setCategories(cats);
        if (cats.length > 0) setCategoryId(cats[0].id);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load services"))
      .finally(() => setLoading(false));
  }, [accessToken]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!categoryId) return;
    setSaving(true);
    setError(null);
    try {
      const created = await createService(accessToken, {
        title,
        base_price: price,
        duration_minutes: Number(duration),
        category: categoryId,
      });
      setServices((prev) => [created, ...prev]);
      setTitle("");
      setPrice("");
      setDuration("60");
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create service");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(service: ManagedService) {
    const updated = await updateServiceActive(accessToken, service.id, !service.is_active);
    setServices((prev) => prev.map((s) => (s.id === service.id ? updated : s)));
  }

  if (loading) return <p className="text-sm text-muted">{t("loading")}</p>;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display font-bold text-ink">{t("myServices")}</h2>
        <Button size="sm" variant={showForm ? "ghost" : "primary"} onClick={() => setShowForm((v) => !v)}>
          {showForm ? t("cancel") : t("addService")}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mb-4 space-y-3 rounded-md border border-line bg-white p-4">
          <input
            placeholder={t("serviceTitle")}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded border border-line px-3 py-2 text-sm text-ink placeholder:text-faint focus:border-brick focus:outline-none"
            required
          />
          <div className="flex gap-3">
            <input
              placeholder={t("price")}
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded border border-line px-3 py-2 text-sm text-ink placeholder:text-faint focus:border-brick focus:outline-none"
              required
            />
            <input
              placeholder={t("duration")}
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full rounded border border-line px-3 py-2 text-sm text-ink placeholder:text-faint focus:border-brick focus:outline-none"
              required
            />
          </div>
          <select
            value={categoryId ?? ""}
            onChange={(e) => setCategoryId(Number(e.target.value))}
            className="w-full rounded border border-line px-3 py-2 text-sm text-ink focus:border-brick focus:outline-none"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {error && <p className="text-sm text-brick">{error}</p>}
          <Button type="submit" disabled={saving} size="sm">
            {saving ? t("saving") : t("save")}
          </Button>
        </form>
      )}

      {services.length === 0 ? (
        <p className="text-sm text-muted">{t("noServices")}</p>
      ) : (
        <div className="space-y-2">
          {services.map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded-md border border-line bg-white p-3 text-sm">
              <div>
                <p className="font-medium text-ink">{s.title}</p>
                <p className="text-muted">Rs {s.base_price} · {s.duration_minutes} min</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={s.is_active ? "verified" : "neutral"}>
                  {s.is_active ? t("active") : t("inactive")}
                </Badge>
                <Button size="sm" variant="ghost" onClick={() => handleToggle(s)}>
                  {t("toggleActive")}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}