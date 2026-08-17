"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { registerUser } from "@/lib/api";
import Link from "next/link";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState<"customer" | "provider">("customer");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const t = useTranslations("auth.register");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await registerUser({ username, email, password, user_type: userType });
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 p-6">
        <h1 className="text-xl font-semibold">{t("title")}</h1>

        <input type="text" placeholder={t("username")} value={username}
          onChange={(e) => setUsername(e.target.value)} className="w-full rounded border px-3 py-2" required />
        <input type="email" placeholder={t("email")} value={email}
          onChange={(e) => setEmail(e.target.value)} className="w-full rounded border px-3 py-2" required />
        <input type="password" placeholder={t("password")} value={password}
          onChange={(e) => setPassword(e.target.value)} className="w-full rounded border px-3 py-2" minLength={8} required />

        <select value={userType} onChange={(e) => setUserType(e.target.value as "customer" | "provider")}
          className="w-full rounded border px-3 py-2">
          <option value="customer">{t("customer")}</option>
          <option value="provider">{t("provider")}</option>
        </select>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={loading} className="w-full rounded bg-black py-2 text-white disabled:opacity-50">
          {loading ? t("submitting") : t("submit")}
        </button>

        <p className="text-sm text-zinc-600">
          {t("haveAccount")} <Link href="/login">{t("loginLink")}</Link>
        </p>
      </form>
    </div>
  );
}