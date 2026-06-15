"use client";

import { useEffect, useRef, useState } from "react";

type DropdownMenuItem = {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
};

type DropdownMenuProps = {
  trigger: React.ReactNode;
  items: DropdownMenuItem[];
  disabled?: boolean;
  align?: "left" | "right";
};

export function DropdownMenu({ trigger, items, disabled, align = "right" }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <div
        onClick={() => { if (!disabled) setOpen(!open); }}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (!disabled) setOpen(!open); } }}
      >
        {trigger}
      </div>

      {open && (
        <div
          className={`absolute top-full ${align === "right" ? "right-0" : "left-0"} mt-1 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] shadow-[var(--shadow-md)] py-1 z-10 min-w-[160px]`}
        >
          {items.map((item, i) => (
            <button
              key={i}
              type="button"
              onClick={() => { setOpen(false); item.onClick(); }}
              className="w-full px-3 py-1.5 text-left text-xs text-[var(--fg)] hover:bg-[var(--fg-soft)] transition-colors flex items-center gap-2"
            >
              {item.icon && <span>{item.icon}</span>}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
