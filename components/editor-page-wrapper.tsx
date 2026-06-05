import EditorPage from "@/components/editor-page";
import { EditorFaq } from "@/components/editor-faq";
import { editorCopy, type EditorLocale } from "@/lib/editor-copy";
import { buildFaqJsonLd } from "@/lib/seo";
import { Check } from "lucide-react";

export function EditorPageWrapper({ locale }: { locale: EditorLocale }) {
  const copy = editorCopy[locale];

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

      {/* Editor */}
      <div className="h-[calc(100dvh-5rem)]">
        <EditorPage />
      </div>

      {/* SEO Header — below the fold for search engines */}
      <section className="border-t border-[var(--border)] bg-[var(--surface)] px-6 py-10">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-xl font-bold text-[var(--fg)]">{copy.h1}</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">{copy.subtitle}</p>
        </div>
      </section>

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

      {/* What This Supports + Limitations */}
      <section className="border-t border-[var(--border)] bg-[var(--surface)] px-6 py-12">
        <div className="mx-auto max-w-4xl grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-lg font-semibold text-[var(--fg)] mb-4">
              {copy.supportsTitle}
            </h2>
            <ul className="space-y-2">
              {copy.supports.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[var(--muted)]">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[var(--fg)] mb-4">
              {copy.limitsTitle}
            </h2>
            <ul className="space-y-2">
              {copy.limits.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[var(--muted)]">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[var(--danger)] shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Input → Output */}
      <section className="border-t border-[var(--border)] bg-[var(--bg)] px-6 py-12">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-lg font-semibold text-[var(--fg)] mb-6">
            {copy.ioTitle}
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-[var(--radius)] border border-[var(--border)] p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)] mb-2">Input</p>
              <p className="text-sm text-[var(--muted)]">{copy.ioInput}</p>
            </div>
            <div className="rounded-[var(--radius)] border border-[var(--border)] p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)] mb-2">Output</p>
              <p className="text-sm text-[var(--muted)]">{copy.ioOutput}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Who Is This For */}
      <section className="border-t border-[var(--border)] bg-[var(--surface)] px-6 py-12">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-lg font-semibold text-[var(--fg)] mb-6">
            {copy.whoTitle}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {copy.whoItems.map((item, i) => (
              <div key={i} className="flex items-start gap-3 rounded-[var(--radius)] border border-[var(--border)] p-4">
                <span className="mt-0.5 text-[var(--accent)]">
                  <Check size={16} strokeWidth={1.6} />
                </span>
                <p className="text-sm text-[var(--muted)]">{item}</p>
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
