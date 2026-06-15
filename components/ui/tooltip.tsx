"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";

type TooltipProps = {
  content: string;
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
};

export function Tooltip({ content, children, side = "bottom", sideOffset = 6 }: TooltipProps) {
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>
        {children}
      </TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          sideOffset={sideOffset}
          className="z-50 rounded-[var(--radius-sm)] bg-[var(--fg)] px-2 py-1 text-[11px] text-[var(--bg)] shadow-[var(--shadow-sm)] animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
        >
          {content}
          <TooltipPrimitive.Arrow className="fill-[var(--fg)]" width={8} height={4} />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}
