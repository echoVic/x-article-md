import { LandingFooter } from "@/components/landing-footer";
import { LandingHeader } from "@/components/landing-header";
import { Accordion } from "@/components/ui/accordion";
import type { LandingLocale } from "@/lib/landing-copy";
import { landingCopy } from "@/lib/landing-copy";
import { buildFaqJsonLd, buildWebApplicationJsonLd, githubRepoUrl } from "@/lib/seo";
import { AlignLeft, Clock, LayoutGrid, MessageSquare, WifiOff, Workflow } from "lucide-react";
import Link from "next/link";

export default function LandingPage({ locale = "en" }: { locale?: LandingLocale }) {
  const t = landingCopy[locale];
  const editorHref = locale === "zh" ? "/zh/editor" : "/editor";

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
                  <AlignLeft size={24} strokeWidth={1.6} />
                </div>
                <h3>{t.feature1Title}</h3>
                <p>{t.feature1Desc}</p>
              </div>
              <div className="feature">
                <div className="feature-mark">
                  <LayoutGrid size={24} strokeWidth={1.6} />
                </div>
                <h3>{t.feature2Title}</h3>
                <p>{t.feature2Desc}</p>
              </div>
              <div className="feature">
                <div className="feature-mark">
                  <Clock size={24} strokeWidth={1.6} />
                </div>
                <h3>{t.feature3Title}</h3>
                <p>{t.feature3Desc}</p>
              </div>
              <div className="feature">
                <div className="feature-mark">
                  <MessageSquare size={24} strokeWidth={1.6} />
                </div>
                <h3>{t.feature4Title}</h3>
                <p>{t.feature4Desc}</p>
              </div>
              <div className="feature">
                <div className="feature-mark">
                  <Workflow size={24} strokeWidth={1.6} />
                </div>
                <h3>{t.feature5Title}</h3>
                <p>{t.feature5Desc}</p>
              </div>
              <div className="feature">
                <div className="feature-mark">
                  <WifiOff size={24} strokeWidth={1.6} />
                </div>
                <h3>{t.feature6Title}</h3>
                <p>{t.feature6Desc}</p>
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
              <Accordion items={t.faqs} />
            </div>
          </div>
        </section>
      </main>

      <LandingFooter locale={locale} />
    </div>
  );
}
