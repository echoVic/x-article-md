"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { buildSharePost, isPublishedArticleUrl } from "@/lib/share-post";

export function SharePostPanel({ title }: { title: string }) {
  const { t, locale } = useI18n();
  const [url, setUrl] = useState("");
  const [draft, setDraft] = useState<{ key: string; text: string } | null>(null);
  const [copy, setCopy] = useState<{ key: string; status: "copying" | "done" | "error" } | null>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const active = useRef(false);
  const revision = useRef(0);
  const mounted = useRef(false);
  const key = JSON.stringify([title, url, locale]);
  const current = useRef(key);
  useEffect(() => { current.current = key; revision.current += 1; }, [key]);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const valid = isPublishedArticleUrl(url);
  const text = draft?.key === key ? draft.text : buildSharePost(title, url, locale);
  const status = copy?.key === key ? copy.status : null;

  async function copyPost() {
    if (!valid || !text.trim() || active.current) return;
    active.current = true;
    const operationRevision = revision.current;
    setCopy({ key, status: "copying" });
    try {
      if (!navigator.clipboard?.writeText) throw new Error("clipboard unavailable");
      await navigator.clipboard.writeText(text);
      if (mounted.current && current.current === key && revision.current === operationRevision) setCopy({ key, status: "done" });
    } catch {
      if (mounted.current && current.current === key && revision.current === operationRevision) {
        setCopy({ key, status: "error" });
        textRef.current?.focus();
        textRef.current?.select();
      }
    } finally {
      active.current = false;
    }
  }

  return (
    <section className="mt-5 space-y-3 border-t border-[var(--border)] p-3">
      <h3 className="text-sm font-semibold text-[var(--fg)]">{t.sharePostTitle}</h3>
      <p className="text-xs leading-5 text-[var(--muted)]">{t.sharePostHint}</p>
      <label className="block text-xs text-[var(--fg)]">
        {t.sharePostUrl}
        <input type="url" value={url} onChange={event => { revision.current += 1; setUrl(event.target.value); setCopy(null); }}
          aria-invalid={!!url && !valid} aria-describedby="share-url-help"
          className="mt-1 min-h-11 w-full rounded border border-[var(--border)] bg-[var(--bg)] px-3 text-sm" />
      </label>
      <p id="share-url-help" className="text-xs text-[var(--muted)]">{url && !valid ? t.sharePostInvalid : t.sharePostUrlHint}</p>
      {!title.trim() && <p className="text-xs text-[var(--warning)]">{t.sharePostMissingTitle}</p>}
      <label className="block text-xs text-[var(--fg)]">
        {t.sharePostText}
        <textarea ref={textRef} value={text} disabled={!valid || !title.trim()} rows={6}
          onChange={event => { revision.current += 1; setDraft({ key, text: event.target.value }); setCopy(null); }}
          className="mt-1 w-full resize-y rounded border border-[var(--border)] bg-[var(--bg)] p-3 text-sm leading-6 disabled:opacity-50" />
      </label>
      <button type="button" disabled={!valid || !text.trim() || status === "copying"} onClick={copyPost}
        className="min-h-11 rounded bg-[var(--fg)] px-3 text-sm text-[var(--bg)] disabled:opacity-40">
        {status === "done" ? t.copied : t.sharePostCopy}
      </button>
      <p role="status" className="text-xs text-[var(--muted)]">{status === "error" ? t.sharePostCopyFailed : t.sharePostReview}</p>
    </section>
  );
}
