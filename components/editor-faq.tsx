import { ChevronDown } from "lucide-react";

type FaqItem = { question: string; answer: string };

export function EditorFaq({
  faqs,
  title,
}: {
  faqs: readonly FaqItem[];
  title: string;
}) {
  return (
    <section className="border-t border-[var(--border)] bg-[var(--surface)] px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-lg font-semibold text-[var(--fg)] mb-6">
          {title}
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <details
              key={i}
              className="group border border-[var(--border)] rounded-[var(--radius)] overflow-hidden"
            >
              <summary className="flex items-center justify-between px-5 py-4 cursor-pointer text-sm font-medium text-[var(--fg)] hover:bg-[var(--fg-soft)] transition-colors">
                {faq.question}
                <ChevronDown className="w-4 h-4 shrink-0 text-[var(--muted)] group-open:rotate-180 transition-transform" />
              </summary>
              <div className="px-5 pb-4 text-sm text-[var(--muted)] leading-relaxed">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
