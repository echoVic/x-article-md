"use client";

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { ChevronDown } from "lucide-react";

type CollapsibleProps = {
  title: React.ReactNode;
  titleRight?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
};

export function Collapsible({ title, titleRight, children, defaultOpen = false }: CollapsibleProps) {
  return (
    <CollapsiblePrimitive.Root defaultOpen={defaultOpen}>
      <CollapsiblePrimitive.Trigger className="flex w-full items-center justify-between px-4 py-3 cursor-pointer text-sm font-medium text-[var(--fg)] hover:bg-[var(--fg-soft)] transition-colors rounded-[var(--radius)] [&[data-state=open]>svg]:rotate-180">
        <span>{title}</span>
        <div className="flex items-center gap-2">
          {titleRight}
          <ChevronDown className="w-4 h-4 shrink-0 text-[var(--muted)] transition-transform duration-200" />
        </div>
      </CollapsiblePrimitive.Trigger>
      <CollapsiblePrimitive.Content className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
        {children}
      </CollapsiblePrimitive.Content>
    </CollapsiblePrimitive.Root>
  );
}
