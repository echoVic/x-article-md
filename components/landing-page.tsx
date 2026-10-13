import { LandingFooter } from "@/components/landing-footer";
import { LandingHeader } from "@/components/landing-header";
import { Accordion } from "@/components/ui/accordion";
import type { LandingLocale } from "@/lib/landing-copy";
import { landingCopy } from "@/lib/landing-copy";
import { buildFaqJsonLd, buildWebApplicationJsonLd, githubRepoUrl } from "@/lib/seo";
import Link from "next/link";

/**
 * Editorial redesign — "MD → X, Vol. 01".
 *
 * The whole landing is arranged like a small independent magazine:
 *   MASTHEAD → COVER STORY → INDEX → THREE ACTS → CLOSING QUOTE → COLOPHON.
 *
 * Visual grammar:
 *   - display serif (Instrument Serif) for headlines and pull-quotes
 *   - mono ALL-CAPS for metadata / eyebrows / step markers
 *   - warm paper background, deep ink text, single ink-red accent
 *   - hairline dividers, numbered index rather than icon cards
 */
export default function LandingPage({ locale = "en" }: { locale?: LandingLocale }) {
  const t = landingCopy[locale];
  const editorHref = locale === "zh" ? "/zh/editor" : "/editor";

  const heroTitleParts = splitHeadline(t.heroTitle);

  const features = [
    { title: t.feature1Title, desc: t.feature1Desc },
    { title: t.feature2Title, desc: t.feature2Desc },
    { title: t.feature3Title, desc: t.feature3Desc },
    { title: t.feature4Title, desc: t.feature4Desc },
    { title: t.feature5Title, desc: t.feature5Desc },
    { title: t.feature6Title, desc: t.feature6Desc },
  ];

  const steps = [
    { label: locale === "zh" ? "第一幕" : "ACT ONE", title: t.step1Title, desc: t.step1Desc },
    { label: locale === "zh" ? "第二幕" : "ACT TWO", title: t.step2Title, desc: t.step2Desc },
    { label: locale === "zh" ? "第三幕" : "ACT THREE", title: t.step3Title, desc: t.step3Desc },
  ];

  const pullquote =
    locale === "zh"
      ? "为长文而生的排版。写作只关心内容，格式交给我们。"
      : "Type­set for long-form. Write the words — leave the formatting to us.";

  return (
    <div className="landing">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildWebApplicationJsonLd()),
        }}
      />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildFaqJsonLd(t.faqs)),
        }}
      />
      <LandingHeader locale={locale} />

      <main>
        {/* ═══ Hero — Cover Story ═══ */}
        <section className="section hero">
          <div className="hero-container">
            <div className="hero-masthead" aria-hidden="true">
              <span>
                <strong>MD2X</strong> · Markdown → X Articles
              </span>
              <span className="hero-masthead-issue">Vol. 01 · 2026</span>
              <span>{locale === "zh" ? "开源刊物" : "Open Source Edition"}</span>
            </div>

            <p className="eyebrow">{t.heroEyebrow}</p>

            <h1>
              {heroTitleParts.head}
              {heroTitleParts.emphasis ? <em>{heroTitleParts.emphasis}</em> : null}
              {heroTitleParts.tail}
            </h1>

            <p className="lead">{t.heroLead}</p>

            <div className="hero-cta">
              <Link href={editorHref} className="btn btn-primary">
                {t.heroOpenEditor}
              </Link>
              <a
                href={githubRepoUrl}
                className="btn btn-secondary"
                target="_blank"
                rel="noopener noreferrer"
                title="MD2X source code on GitHub"
              >
                {t.heroGitHub}
              </a>
            </div>

            {/* Product mockup — reframed as a manuscript/proof spread */}
            <div className="product-frame">
              <div className="product-frame-bar">
                <div className="product-frame-tab">
                  <span className="product-frame-tab-index">01</span>
                  <span>{locale === "zh" ? "手稿 · MARKDOWN" : "MANUSCRIPT · MARKDOWN"}</span>
                </div>
                <div className="product-frame-tab">
                  <span className="product-frame-tab-index">02</span>
                  <span>{locale === "zh" ? "样张 · X ARTICLES" : "PROOF · X ARTICLES"}</span>
                </div>
              </div>
              <div className="product-frame-content">
                <div className="product-frame-editor">
                  {`# Writing on X Articles

Long-form posts deserve real
formatting. Draft in Markdown,
publish without the busywork.

## Paste with one click

\`\`\`typescript
const article = toXArticles(
  markdown,
);
\`\`\``}
                </div>
                <div className="product-frame-preview">
                  <h3>Writing on X Articles</h3>
                  <p>
                    Long-form posts deserve real formatting. Draft in Markdown,
                    publish without the busywork.
                  </p>
                  <p className="preview-subtitle">Paste with one click</p>
                  <div className="preview-code">
                    <span className="code-keyword">const</span> article ={" "}
                    <span className="code-type">toXArticles</span>(
                    <br />
                    &nbsp;&nbsp;markdown,
                    <br />
                    );
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ Features — Table of Contents ═══ */}
        <section className="section" id="features">
          <div className="container section-col">
            <div className="section-header">
              <p className="eyebrow">{t.featuresEyebrow}</p>
              <h2>{t.featuresTitle}</h2>
            </div>
            <div className="features-grid">
              {features.map((feature, i) => (
                <article className="feature" key={feature.title}>
                  <div className="feature-index">
                    {String(i + 1).padStart(2, "0")} —
                  </div>
                  <div className="feature-body">
                    <h3>{feature.title}</h3>
                    <p>{feature.desc}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ Workflow — Three Acts ═══ */}
        <section className="section" id="workflow">
          <div className="container section-col">
            <div className="section-header">
              <p className="eyebrow">{t.workflowEyebrow}</p>
              <h2>{t.workflowTitle}</h2>
            </div>
            <div className="workflow-steps">
              {steps.map((step, i) => (
                <div
                  className="workflow-step"
                  key={step.title}
                  data-step={`§${String(i + 1).padStart(2, "0")}`}
                >
                  <span className="meta">{step.label}</span>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ CTA — Closing pull-quote ═══ */}
        <section className="section cta-section">
          <div className="container">
            <p className="cta-pullquote">&ldquo;{pullquote}&rdquo;</p>
            <h2>{t.ctaTitle}</h2>
            <p className="lead">{t.ctaDesc}</p>
            <Link href={editorHref} className="btn btn-primary">
              {t.ctaOpenEditor}
            </Link>
          </div>
        </section>

        {/* ═══ FAQ — Colophon Q&A ═══ */}
        <section className="section" id="faq">
          <div className="container section-col">
            <div className="section-header">
              <p className="eyebrow">{locale === "zh" ? "读者来信" : "READER Q&A"}</p>
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

/**
 * Split a headline into `head · emphasis · tail` so the middle noun-phrase can
 * be typeset in italic serif with a soft underline. Heuristic per locale — if
 * the strategy misses, we simply render the whole string as `head` and skip
 * the emphasis span (no visual regression).
 */
function splitHeadline(title: string): { head: string; emphasis: string; tail: string } {
  // English: "Write Markdown, publish to X Articles" → emphasise "X Articles"
  const enMatch = title.match(/^(.*?)(X Articles)(.*)$/);
  if (enMatch) {
    return { head: enMatch[1], emphasis: enMatch[2], tail: enMatch[3] };
  }
  // Chinese: "写 Markdown，发布到 X Articles" → emphasise "X Articles"
  const zhMatch = title.match(/^(.*?)(X Articles)(.*)$/);
  if (zhMatch) {
    return { head: zhMatch[1], emphasis: zhMatch[2], tail: zhMatch[3] };
  }
  return { head: title, emphasis: "", tail: "" };
}
