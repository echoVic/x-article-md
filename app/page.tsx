"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { LanguageToggle } from "@/components/language-toggle";

export default function LandingPage() {
  const { t } = useI18n();

  return (
    <div className="landing">
      {/* ═══ Top Nav ═══ */}
      <header className="topnav">
        <div className="container topnav-inner">
          <span className="logo">
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '15px', letterSpacing: '-0.03em' }}>MD</span>
            <span style={{ color: 'var(--accent)', fontSize: '12px', margin: '0 2px' }}>→</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '15px', letterSpacing: '-0.03em' }}>X</span>
          </span>
          <nav className="topnav-links">
            <a href="#features">{t.navFeatures}</a>
            <a href="#workflow">{t.navWorkflow}</a>
            <Link href="/editor">{t.navOpenEditor}</Link>
          </nav>
          <div className="topnav-actions">
            <LanguageToggle />
            <Link href="/editor" className="btn btn-primary">
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
              <Link href="/editor" className="btn btn-primary">
                {t.heroOpenEditor}
              </Link>
              <a
                href="https://github.com"
                className="btn btn-secondary"
                target="_blank"
                rel="noopener noreferrer"
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
            <Link href="/editor" className="btn btn-primary">
              {t.ctaOpenEditor}
            </Link>
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
