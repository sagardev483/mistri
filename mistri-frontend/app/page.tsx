import Link from "next/link";
import { getTranslations } from "next-intl/server";
import Button from "@/components/ui/Button";

export default async function Home() {
  const t = await getTranslations("home");

  const steps = [
    { n: "01", title: t("step1Title"), body: t("step1Body") },
    { n: "02", title: t("step2Title"), body: t("step2Body") },
    { n: "03", title: t("step3Title"), body: t("step3Body") },
    { n: "04", title: t("step4Title"), body: t("step4Body") },
  ];

  const trades = [
    { name: t("tradePlumbing"), body: t("tradePlumbingBody") },
    { name: t("tradeElectrical"), body: t("tradeElectricalBody") },
    { name: t("tradeCarpentry"), body: t("tradeCarpentryBody") },
    { name: t("tradeMore"), body: t("tradeMoreBody") },
  ];

  return (
    <div className="flex-1">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line px-6 py-20 sm:py-28">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <span className="mb-6 font-mono text-xs tracking-widest text-faint">
            {t("heroEyebrow")}
          </span>

          <h1 className="motion-safe:animate-[fade-up_0.7s_ease-out_both] font-display text-4xl font-bold leading-[1.05] text-ink sm:text-6xl">
            {t("heroTitle")}
          </h1>

          <p className="motion-safe:animate-[fade-up_0.7s_ease-out_0.1s_both] mt-5 max-w-xl text-base text-muted sm:text-lg">
            {t("heroSubtitle")}
          </p>

          <div className="motion-safe:animate-[fade-up_0.7s_ease-out_0.2s_both] mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/providers/nearby">
              <Button size="md">{t("ctaFindPrimary")}</Button>
            </Link>
            <Link href="/services">
              <Button size="md" variant="ghost">
                {t("ctaFindSecondary")}
              </Button>
            </Link>
          </div>

          <p className="mt-6 text-xs text-faint">{t("trustLine")}</p>
        </div>

        {/* Signature: oversized rotated verification stamp */}
        <div
          aria-hidden="true"
          className="motion-safe:animate-[stamp-in_0.8s_ease-out_0.3s_both] pointer-events-none absolute -right-8 top-10 hidden -rotate-12 sm:block md:right-8 lg:right-16"
        >
          <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-verified/70 md:h-36 md:w-36">
            <span className="text-center font-display text-sm font-bold uppercase leading-tight tracking-wide text-verified/80 md:text-base">
              {t("heroStamp")}
            </span>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-line px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <p className="mb-8 font-mono text-xs uppercase tracking-widest text-faint">
            {t("howItWorksEyebrow")}
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div key={step.n} className="border-t-2 border-brick pt-4">
                <span className="font-mono text-sm text-faint">{step.n}</span>
                <p className="mt-1 font-display text-lg font-bold text-ink">{step.title}</p>
                <p className="mt-1 text-sm text-muted">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trades */}
      <section className="border-b border-line px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <p className="mb-8 font-mono text-xs uppercase tracking-widest text-faint">
            {t("tradesEyebrow")}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {trades.map((trade) => (
              <div
                key={trade.name}
                className="rounded-md border border-line bg-white p-4 transition-transform hover:-translate-y-0.5"
              >
                <p className="font-display text-base font-bold text-ink">{trade.name}</p>
                <p className="mt-1 text-xs text-muted">{trade.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Provider CTA */}
      <section className="px-6 py-16">
        <div className="mx-auto flex max-w-4xl flex-col items-start gap-4 rounded-md border border-line bg-white p-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 font-mono text-xs uppercase tracking-widest text-faint">
              {t("providerEyebrow")}
            </p>
            <h2 className="font-display text-2xl font-bold text-ink">{t("providerTitle")}</h2>
            <p className="mt-2 max-w-md text-sm text-muted">{t("providerBody")}</p>
          </div>
          <Link href="/register" className="shrink-0">
            <Button size="md" variant="secondary">
              {t("ctaBecome")}
            </Button>
          </Link>
        </div>
        <p className="mx-auto mt-8 max-w-4xl text-center text-xs text-faint">{t("footerNote")}</p>
      </section>
    </div>
  );
}