"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

type AccordionItem = { question: string; answer: string };

type AccordionProps = {
  items: readonly AccordionItem[];
};

export function Accordion({ items }: AccordionProps) {
  return (
    <AccordionPrimitive.Root type="multiple" className="w-full space-y-2">
      {items.map((item, i) => (
        <AccordionPrimitive.Item
          key={i}
          value={`item-${i}`}
          className="border border-[var(--border)] rounded-[var(--radius)] overflow-hidden"
        >
          <AccordionPrimitive.Header>
            <AccordionPrimitive.Trigger className="flex w-full items-center justify-between px-5 py-4 cursor-pointer text-sm font-medium text-[var(--fg)] hover:bg-[var(--fg-soft)] transition-colors [&[data-state=open]>svg]:rotate-180">
              {item.question}
              <ChevronDown className="w-4 h-4 shrink-0 text-[var(--muted)] transition-transform duration-200" />
            </AccordionPrimitive.Trigger>
          </AccordionPrimitive.Header>
          <AccordionPrimitive.Content className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
            <div className="px-5 pb-4 text-sm text-[var(--muted)] leading-relaxed">
              {item.answer}
            </div>
          </AccordionPrimitive.Content>
        </AccordionPrimitive.Item>
      ))}
    </AccordionPrimitive.Root>
  );
}
