import { Accordion } from "./ui/accordion";

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
        <Accordion items={faqs} />
      </div>
    </section>
  );
}
