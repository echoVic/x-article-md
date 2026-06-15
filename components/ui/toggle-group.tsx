"use client";

import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";

type ToggleGroupItem = {
  value: string;
  label: React.ReactNode;
};

type ToggleGroupProps = {
  value: string;
  onValueChange: (value: string) => void;
  items: ToggleGroupItem[];
};

export function ToggleGroup({ value, onValueChange, items }: ToggleGroupProps) {
  return (
    <ToggleGroupPrimitive.Root
      type="single"
      value={value}
      onValueChange={(v) => { if (v) onValueChange(v); }}
      className="flex items-center bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-[2px] gap-[2px]"
    >
      {items.map((item) => (
        <ToggleGroupPrimitive.Item
          key={item.value}
          value={item.value}
          className="flex items-center gap-[4px] px-2.5 py-[3px] rounded-[var(--radius-sm)] text-[11px] font-medium transition-all text-[var(--muted)] hover:text-[var(--fg)] data-[state=on]:bg-[var(--bg)] data-[state=on]:text-[var(--fg)] data-[state=on]:shadow-[var(--shadow-sm)]"
        >
          {item.label}
        </ToggleGroupPrimitive.Item>
      ))}
    </ToggleGroupPrimitive.Root>
  );
}
