"use client";

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";

type DropdownMenuItem = {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
};

type DropdownMenuProps = {
  trigger: React.ReactNode;
  items: DropdownMenuItem[];
  disabled?: boolean;
  align?: "start" | "end";
};

export function DropdownMenu({ trigger, items, disabled, align = "end" }: DropdownMenuProps) {
  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild disabled={disabled}>
        {trigger}
      </DropdownMenuPrimitive.Trigger>

      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align={align}
          sideOffset={4}
          className="min-w-[160px] bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] shadow-[var(--shadow-md)] py-1 z-50 animate-in fade-in-0 zoom-in-95"
        >
          {items.map((item, i) => (
            <DropdownMenuPrimitive.Item
              key={i}
              onSelect={item.onClick}
              className="w-full px-3 py-1.5 text-left text-xs text-[var(--fg)] hover:bg-[var(--fg-soft)] transition-colors flex items-center gap-2 outline-none cursor-default data-[highlighted]:bg-[var(--fg-soft)]"
            >
              {item.icon && <span>{item.icon}</span>}
              <span>{item.label}</span>
            </DropdownMenuPrimitive.Item>
          ))}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
}
