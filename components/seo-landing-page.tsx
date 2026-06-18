import { LandingFooter } from "@/components/landing-footer";
import { LandingHeader } from "@/components/landing-header";
import type { SeoLandingContent } from "@/lib/seo-landing-copy";
import Link from "next/link";

export function SeoLandingPage({ content }: { content: SeoLandingContent }) {
  return (
    <div className="landing">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(content.jsonLd),
        }}
      />
      <LandingHeader locale="en" />

      <main>
        {/* Hero */}
        <section className="section hero">
          <div className="container hero-container">
            <p className="eyebrow">{content.eyebrow}</p>
            <h1>{content.title}</h1>
            <p className="lead">{content.lead}</p>
            <div className="hero-cta">
              <Link href={content.ctaHref} className="btn btn-primary">
                {content.ctaButtonText}
              </Link>
            </div>
          </div>
        </section>

        {/* Problem */}
        <section className="section" id="problem">
          <div className="container section-col">
            <div className="section-header">
              <h2>{content.problemTitle}</h2>
              <p className="lead">{content.problemDescription}</p>
            </div>
            <ul className="seo-points">
              {content.problemPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* Solution */}
        <section className="section" id="solution">
          <div className="container section-col">
            <div className="section-header">
              <h2>{content.solutionTitle}</h2>
              <p className="lead">{content.solutionDescription}</p>
            </div>
            <ul className="seo-points seo-points--check">
              {content.solutionPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* Steps */}
        <section className="section" id="steps">
          <div className="container section-col">
            <div className="section-header">
              <p className="eyebrow">STEP BY STEP</p>
              <h2>{content.stepsTitle}</h2>
            </div>
            <div className="workflow-steps">
              {content.steps.map((step) => (
                <div key={step.title} className="workflow-step">
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Demo */}
        {content.demoSection && (
          <section className="section" id="demo">
            <div className="container section-col">
              <div className="section-header">
                <h2>{content.demoSection.title}</h2>
              </div>
              <div className="product-frame">
                <div className="product-frame-bar">
                  <div className="product-frame-dot" />
                  <div className="product-frame-dot" />
                  <div className="product-frame-dot" />
                </div>
                <div className="product-frame-content">
                  <div className="product-frame-editor">
                    <div className="text-[11px] font-medium text-[var(--muted)] mb-2 uppercase tracking-wider">
                      {content.demoSection.beforeLabel}
                    </div>
                    <pre className="whitespace-pre-wrap text-[13px] leading-relaxed">
                      {content.demoSection.beforeContent}
                    </pre>
                  </div>
                  <div className="product-frame-preview">
                    <div className="text-[11px] font-medium text-[var(--muted)] mb-2 uppercase tracking-wider">
                      {content.demoSection.afterLabel}
                    </div>
                    <p className="text-[14px] text-[var(--muted)] leading-relaxed">
                      {content.demoSection.afterContent}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="section cta-section">
          <div className="container">
            <h2>{content.ctaTitle}</h2>
            <p className="lead">{content.ctaDescription}</p>
            <Link href={content.ctaHref} className="btn btn-primary">
              {content.ctaButtonText}
            </Link>
          </div>
        </section>
      </main>

      <LandingFooter locale="en" />
    </div>
  );
}
