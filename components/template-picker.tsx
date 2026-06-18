"use client";

import { useI18n } from "@/lib/i18n";
import { ARTICLE_TEMPLATES, type ArticleTemplate } from "@/lib/templates";
import {
  BookOpen,
  Hammer,
  MessageSquareText,
  Network,
  Tag,
  Wrench,
} from "lucide-react";
import { Dialog } from "./ui/dialog";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>> = {
  BookOpen,
  Hammer,
  Network,
  Tag,
  MessageSquareText,
  Wrench,
};

type TemplatePickerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (template: ArticleTemplate) => void;
};

export function TemplatePicker({ open, onOpenChange, onSelect }: TemplatePickerProps) {
  const { t } = useI18n();

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={t.templatePickerTitle}>
      <p className="text-[12px] text-[var(--muted)] mb-4">{t.templatePickerDesc}</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {ARTICLE_TEMPLATES.map((template) => {
          const Icon = ICON_MAP[template.icon];
          const name = t[template.nameKey as keyof typeof t] || template.id;
          const desc = t[template.descriptionKey as keyof typeof t] || "";
          return (
            <button
              key={template.id}
              type="button"
              onClick={() => onSelect(template)}
              className="flex flex-col items-start gap-2 p-4 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] hover:border-[var(--accent)] hover:bg-[var(--fg-soft)] transition-all text-left group"
            >
              {Icon && (
                <Icon
                  size={20}
                  strokeWidth={1.5}
                  className="text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors"
                />
              )}
              <span className="text-[13px] font-medium text-[var(--fg)]">{name}</span>
              <span className="text-[11px] text-[var(--muted)] leading-tight">{desc}</span>
            </button>
          );
        })}
      </div>
    </Dialog>
  );
}
