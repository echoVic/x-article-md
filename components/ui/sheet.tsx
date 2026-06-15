"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

type SheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  titleRight?: React.ReactNode;
  children: React.ReactNode;
};

export function Sheet({ open, onOpenChange, title, titleRight, children }: SheetProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-30 bg-black/20 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <DialogPrimitive.Content className="fixed top-0 right-0 z-40 h-full w-full max-w-md border-l border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-lg)] flex flex-col data-[state=open]:animate-slide-in-from-right data-[state=closed]:animate-slide-out-to-right">
          <div className="flex items-center justify-between px-5 h-12 border-b border-[var(--border)] flex-shrink-0">
            <div className="flex items-center gap-2">
              <DialogPrimitive.Title className="text-sm font-medium text-[var(--fg)]">
                {title}
              </DialogPrimitive.Title>
              {titleRight}
            </div>
            <DialogPrimitive.Close className="inline-flex items-center justify-center w-7 h-7 rounded-[var(--radius-sm)] text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--fg-soft)] transition-all">
              <X size={14} strokeWidth={1.5} aria-hidden="true" />
            </DialogPrimitive.Close>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            {children}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
