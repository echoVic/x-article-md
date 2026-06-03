import Link from "next/link";
import type { LandingLocale } from "@/lib/landing-copy";
import { landingCopy } from "@/lib/landing-copy";
import { buildWebApplicationJsonLd, buildFaqJsonLd, githubRepoUrl } from "@/lib/seo";

export default function LandingPage({ locale = "en" }: { locale?: LandingLocale }) {
  const t = landingCopy[locale];
  const editorHref = locale === "zh" ? "/zh/editor" : "/editor";
  const threadHref = locale === "zh" ? "/zh/thread" : "/thread";

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
      {/* ═══ Top Nav ═══ */}
      <header className="topnav">
        <div className="container topnav-inner">
          <span className="logo">
            <Link href="/" title="MD2X - Markdown to X Articles Converter" style={{ textDecoration: 'none', color: 'inherit' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '15px', letterSpacing: '-0.03em' }}>MD</span>
              <span style={{ color: 'var(--accent)', fontSize: '12px', margin: '0 2px' }}>→</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '15px', letterSpacing: '-0.03em' }}>X</span>
            </Link>
          </span>
          <nav className="topnav-links">
            <a href="#features">{t.navFeatures}</a>
            <Link href={editorHref}>{t.navOpenEditor}</Link>
            <Link href={threadHref}>{t.navThread}</Link>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="topnav-actions">
            <Link
              href={locale === "en" ? "/zh" : "/"}
              className="inline-flex items-center gap-1 rounded-[var(--radius-sm)] border border-[var(--border)] px-2 py-1 text-[11px] font-medium text-[var(--muted)] transition hover:text-[var(--fg)] hover:bg-[var(--fg-soft)] no-underline"
              aria-label={locale === "en" ? "切换到中文" : "Switch to English"}
              title={locale === "en" ? "切换到中文" : "Switch to English"}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
                <circle cx="8" cy="8" r="6.5" />
                <path d="M1.5 8h13M8 1.5c-2 2-2.5 4-2.5 6.5s.5 4.5 2.5 6.5M8 1.5c2 2 2.5 4 2.5 6.5s-.5 4.5-2.5 6.5" />
              </svg>
              {locale === "en" ? "中文" : "EN"}
            </Link>
            <Link href={editorHref} className="btn btn-primary">
              {t.navGetStarted}
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* ═══ Hero ═══ */}
        <section className="section hero">
          <div className="container hero-container">
            <p className="eyebrow">{t.heroEyebrow}</p>
            <h1>{t.heroTitle}</h1>
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

            {/* Product mockup */}
            <div className="product-frame">
              <div className="product-frame-bar">
                <div className="product-frame-dot" />
                <div className="product-frame-dot" />
                <div className="product-frame-dot" />
              </div>
              <div className="product-frame-content">
                <div className="product-frame-editor">
                  {`# Building a sync engine

Writing a sync engine from scratch
sounds hard — and it is. But the
core algorithm is surprisingly
elegant.

## The CRDT approach

\`\`\`typescript
type Op = {
  id: string;
  parent: string;
  content: string;
}
\`\`\``}
                </div>
                <div className="product-frame-preview">
                  <h3>Building a sync engine</h3>
                  <p>
                    Writing a sync engine from scratch sounds hard — and it is.
                    But the core algorithm is surprisingly elegant.
                  </p>
                  <p className="preview-subtitle">The CRDT approach</p>
                  <div className="preview-code">
                    <span className="code-keyword">type</span> Op = &#123;
                    <br />
                    &nbsp;&nbsp;id: <span className="code-type">string</span>;
                    <br />
                    &nbsp;&nbsp;parent:{" "}
                    <span className="code-type">string</span>;
                    <br />
                    &nbsp;&nbsp;content:{" "}
                    <span className="code-type">string</span>;
                    <br />
                    &#125;
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ Features ═══ */}
        <section className="section" id="features">
          <div className="container section-col">
            <div className="section-header">
              <p className="eyebrow">{t.featuresEyebrow}</p>
              <h2>{t.featuresTitle}</h2>
            </div>
            <div className="grid-3">
              <div className="feature">
                <div className="feature-mark">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  >
                    <path d="M4 7h16M4 12h10M4 17h16" />
                  </svg>
                </div>
                <h3>{t.feature1Title}</h3>
                <p>{t.feature1Desc}</p>
              </div>
              <div className="feature">
                <div className="feature-mark">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="3" />
                    <path d="M8 8h3v3H8zM13 8h3v3h-3zM8 13h3v3H8z" />
                  </svg>
                </div>
                <h3>{t.feature2Title}</h3>
                <p>{t.feature2Desc}</p>
              </div>
              <div className="feature">
                <div className="feature-mark">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                </div>
                <h3>{t.feature3Title}</h3>
                <p>{t.feature3Desc}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ Workflow ═══ */}
        <section className="section" id="workflow">
          <div className="container section-col">
            <div className="section-header">
              <p className="eyebrow">{t.workflowEyebrow}</p>
              <h2>{t.workflowTitle}</h2>
            </div>
            <div className="workflow-steps">
              <div className="workflow-step">
                <h3>{t.step1Title}</h3>
                <p>{t.step1Desc}</p>
              </div>
              <div className="workflow-step">
                <h3>{t.step2Title}</h3>
                <p>{t.step2Desc}</p>
              </div>
              <div className="workflow-step">
                <h3>{t.step3Title}</h3>
                <p>{t.step3Desc}</p>
              </div>
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
              {t.faqs.map((faq, i) => (
                <details
                  key={i}
                  className="faq-item"
                >
                  <summary className="faq-question">{faq.question}</summary>
                  <p className="faq-answer">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ═══ Footer ═══ */}
      <footer className="pagefoot">
        <div className="container pagefoot-inner">
          <span>x-article-md · 2026</span>
          <span className="meta">{t.footerTagline}</span>
        </div>
      </footer>
    </div>
  );
}
