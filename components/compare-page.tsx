import { LandingFooter } from "@/components/landing-footer";
import { LandingHeader } from "@/components/landing-header";
import { Accordion } from "@/components/ui/accordion";
import {
  compareCheckedDate,
  getCompareContent,
  getComparePath,
  type CompareLocale,
  type CompareTool,
} from "@/lib/compare-copy";
import { buildBreadcrumbJsonLd } from "@/lib/seo";
import { Check, ExternalLink } from "lucide-react";
import Link from "next/link";

export function ComparePage({ locale = "en" }: { locale?: CompareLocale }) {
  const t = getCompareContent(locale);
  const editorHref = locale === "zh" ? "/zh/editor" : "/editor";
  const homeHref = locale === "zh" ? "/zh" : "/";
  const path = getComparePath(locale);

  const breadcrumbItems = [
    { name: "MD2X", path: homeHref },
    { name: t.heroTitle, path },
  ];

  const tools = t.tools;

  return (
    <div className="landing">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems)),
        }}
      />
      <LandingHeader locale={locale} />

      <main>
        {/* Hero */}
        <section className="section hero">
          <div className="container hero-container">
            <p className="eyebrow">{t.heroEyebrow}</p>
            <h1>{t.heroTitle}</h1>
            <p className="lead">{t.heroLead}</p>
            <div className="hero-cta">
              <Link href={editorHref} className="btn btn-primary">
                {locale === "zh" ? "打开 MD2X 编辑器" : "Open the MD2X editor"}
              </Link>
            </div>
          </div>
        </section>

        {/* Intro */}
        <section className="section">
          <div className="container section-col">
            <div className="section-header">
              <h2>{t.introTitle}</h2>
              <p className="lead">{t.introBody}</p>
            </div>
          </div>
        </section>

        {/* Tool cards */}
        <section className="section" id="tools">
          <div className="container">
            <div className="section-header">
              <h2>{t.toolsTitle}</h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              {tools.map((tool) => (
                <div
                  key={tool.name}
                  className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-6"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-lg font-semibold text-[var(--fg)]">
                      {tool.name}
                    </h3>
                    {tool.url ? (
                      <a
                        href={tool.url}
                        className="inline-flex items-center gap-1 text-xs text-[var(--accent)] no-underline hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {tool.sourceLabel}
                        <ExternalLink size={12} strokeWidth={1.8} aria-hidden="true" />
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-[var(--muted)]">
                        {tool.sourceLabel}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-[var(--muted)] leading-relaxed">
                    {tool.whatItIs}
                  </p>
                  <ul className="mt-4 space-y-2">
                    {tool.strengths.map((strength) => (
                      <li
                        key={strength}
                        className="flex items-start gap-2 text-sm text-[var(--muted)]"
                      >
                        <Check size={15} strokeWidth={2} className="mt-0.5 shrink-0 text-[var(--accent)]" aria-hidden="true" />
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 text-xs font-medium text-[var(--fg)]">
                    {locale === "zh" ? "最适合：" : "Best for: "}
                    {tool.bestFor}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison table */}
        <section className="section" id="compare-table">
          <div className="container">
            <div className="section-header">
              <h2>{t.tableTitle}</h2>
            </div>
            <div className="overflow-x-auto rounded-[var(--radius)] border border-[var(--border)]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[var(--fg-soft)] text-left">
                    <th className="px-4 py-3 font-semibold text-[var(--fg)]">
                      {locale === "zh" ? "能力" : "Capability"}
                    </th>
                    {tools.map((tool) => (
                      <th
                        key={tool.name}
                        className="px-4 py-3 font-semibold text-[var(--fg)]"
                      >
                        {tool.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {t.rows.map((row) => (
                    <tr key={row.capability} className="border-t border-[var(--border)]">
                      <td className="px-4 py-3 font-medium text-[var(--fg)]">
                        {row.capability}
                      </td>
                      {row.values.map((value, i) => (
                        <td key={i} className="px-4 py-3 text-[var(--muted)]">
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* When to use which */}
        <section className="section">
          <div className="container section-col">
            <div className="section-header">
              <h2>{t.whenTitle}</h2>
            </div>
            <ul className="feature-checklist">
              {t.whenItems.map((item) => (
                <li key={item}>
                  <Check size={18} strokeWidth={2} aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* FAQ */}
        <section className="section" id="faq">
          <div className="container section-col">
            <div className="section-header">
              <h2>{t.faqTitle}</h2>
            </div>
            <div className="faq-list">
              <Accordion items={t.faqs} />
            </div>
          </div>
        </section>

        {/* Sources */}
        <section className="section">
          <div className="container section-col">
            <div className="section-header">
              <h2>{t.sourcesTitle}</h2>
              <p className="text-sm text-[var(--muted)]">
                {t.sourcesNote} {compareCheckedDate}。
              </p>
            </div>
            <ul className="space-y-2">
              {t.sources.map((source) => (
                <li key={source.url}>
                  <a
                    href={source.url}
                    className="text-sm text-[var(--accent)] no-underline hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {source.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CTA */}
        <section className="section cta-section">
          <div className="container">
            <h2>{locale === "zh" ? "把你的下一篇文章发到 X Articles" : "Publish your next article to X Articles"}</h2>
            <Link href={editorHref} className="btn btn-primary">
              {locale === "zh" ? "打开 MD2X 编辑器" : "Open the MD2X editor"}
            </Link>
          </div>
        </section>
      </main>

      <LandingFooter locale={locale} />
    </div>
  );
}
