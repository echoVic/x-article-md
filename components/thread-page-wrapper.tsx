import ThreadPage from "@/components/thread-page";
import { EditorFaq } from "@/components/editor-faq";
import { threadCopy, type ThreadLocale } from "@/lib/thread-copy";
import { buildFaqJsonLd } from "@/lib/seo";

export function ThreadPageWrapper({ locale }: { locale: ThreadLocale }) {
  const copy = threadCopy[locale];

  return (
    <div className="flex flex-col">
      {/* FAQPage JSON-LD */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildFaqJsonLd(copy.faqs)),
        }}
      />

      {/* SEO Header */}
      <section className="border-b border-[var(--border)] bg-[var(--surface)] px-6 py-4">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-xl font-bold text-[var(--fg)]">{copy.h1}</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">{copy.subtitle}</p>
        </div>
      </section>

      {/* Thread Generator */}
      <ThreadPage />

      {/* How to Use */}
      <section className="border-t border-[var(--border)] bg-[var(--bg)] px-6 py-12">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-lg font-semibold text-[var(--fg)] mb-6">
            {copy.howToTitle}
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {copy.steps.map((step, i) => (
              <div key={i}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--accent)] text-white text-xs font-bold">
                    {i + 1}
                  </span>
                  <h3 className="font-medium text-[var(--fg)]">{step.title}</h3>
                </div>
                <p className="text-sm text-[var(--muted)]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <EditorFaq faqs={copy.faqs} title={copy.faqTitle} />
    </div>
  );
}
