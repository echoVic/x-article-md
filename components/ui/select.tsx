"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { ChevronDown, Check } from "lucide-react";

type SelectOption = { value: string; label: string };

type SelectProps = {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
};

export function Select({ value, onValueChange, options, placeholder }: SelectProps) {
  return (
    <SelectPrimitive.Root value={value} onValueChange={onValueChange}>
      <SelectPrimitive.Trigger className="inline-flex items-center gap-1 h-[26px] rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-2 text-[11px] font-medium text-[var(--fg)] outline-none focus:border-[var(--accent)] data-[placeholder]:text-[var(--muted)]">
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon>
          <ChevronDown size={10} strokeWidth={2} aria-hidden="true" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={4}
          className="z-50 min-w-[var(--radix-select-trigger-width)] max-h-[200px] bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] shadow-[var(--shadow-md)] py-1 animate-in fade-in-0 zoom-in-95"
        >
          <SelectPrimitive.Viewport>
            {options.map((opt) => (
              <SelectPrimitive.Item
                key={opt.value}
                value={opt.value}
                className="flex items-center gap-2 px-3 py-1.5 text-xs text-[var(--fg)] outline-none cursor-default data-[highlighted]:bg-[var(--fg-soft)]"
              >
                <SelectPrimitive.ItemIndicator className="w-3">
                  <Check size={10} strokeWidth={2.5} />
                </SelectPrimitive.ItemIndicator>
                <SelectPrimitive.ItemText>{opt.label}</SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
