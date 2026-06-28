import { LandingFooter } from "@/components/landing-footer";
import { LandingHeader } from "@/components/landing-header";
import { Accordion } from "@/components/ui/accordion";
import type { FeatureLandingDef, LandingLocale } from "@/lib/feature-landing-copy";
import { buildFaqJsonLd, buildHowToJsonLd, githubRepoUrl } from "@/lib/seo";
import { Check } from "lucide-react";
import Link from "next/link";

export function FeatureLandingPage({
  def,
  locale = "en",
}: {
  def: FeatureLandingDef;
  locale?: LandingLocale;
}) {
  const t = def[locale];
  const editorHref = locale === "zh" ? def.zhEditorPath : def.editorPath;

  return (
    <div className="landing">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildFaqJsonLd(t.faqs)),
        }}
      />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildHowToJsonLd({
              name: t.howToTitle,
              description: t.howToDescription,
              steps: t.steps,
            }),
          ),
        }}
      />
      <LandingHeader locale={locale} />

      <main>
        {/* ═══ Hero ═══ */}
        <section className="section hero">
          <div className="container hero-container">
            <p className="eyebrow">{t.heroEyebrow}</p>
            <h1>{t.heroTitle}</h1>
            <p className="lead">{t.heroLead}</p>
            <div className="hero-cta">
              <Link href={editorHref} className="btn btn-primary">
                {t.ctaOpenEditor}
              </Link>
              <a
                href={githubRepoUrl}
                className="btn btn-secondary"
                target="_blank"
                rel="noopener noreferrer"
                title="MD2X source code on GitHub"
              >
                GitHub
              </a>
            </div>
          </div>
        </section>

        {/* ═══ Intro + benefits ═══ */}
        <section className="section" id="overview">
          <div className="container section-col">
            <div className="section-header">
              <h2>{t.introTitle}</h2>
              <p className="lead">{t.introBody}</p>
            </div>
            <div className="section-header">
              <p className="eyebrow">{t.benefitsTitle}</p>
            </div>
            <ul className="feature-checklist">
              {t.benefits.map((benefit) => (
                <li key={benefit}>
                  <Check size={18} strokeWidth={2} aria-hidden="true" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ═══ How-to ═══ */}
        <section className="section" id="how-it-works">
          <div className="container section-col">
            <div className="section-header">
              <p className="eyebrow">{t.howToEyebrow}</p>
              <h2>{t.howToTitle}</h2>
            </div>
            <div className="workflow-steps">
              {t.steps.map((step) => (
                <div className="workflow-step" key={step.name}>
                  <h3>{step.name}</h3>
                  <p>{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ CTA ═══ */}
        <section className="section cta-section">
          <div className="container">
            <h2>{t.ctaTitle}</h2>
            <p className="lead">{t.ctaDesc}</p>
            <Link href={editorHref} className="btn btn-primary">
              {t.ctaOpenEditor}
            </Link>
          </div>
        </section>

        {/* ═══ FAQ ═══ */}
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
      </main>

      <LandingFooter locale={locale} />
    </div>
  );
}
