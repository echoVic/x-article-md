"use client";

import { useState, useCallback, useSyncExternalStore } from "react";
import { splitThread } from "@/lib/thread";
import { useI18n } from "@/lib/i18n";
import { trackEvent } from "@/lib/analytics";
import { AppHeader } from "@/components/app-header";
import { Sparkles, Copy, RotateCcw, Check } from "lucide-react";

const defaultMarkdown = `# Why Every Developer Should Write

Writing clarifies thinking. When you explain a concept in words, you discover gaps in your understanding that code alone never reveals.

## The Compound Effect

A single blog post might get 100 views. But over a year, 50 posts compound into a body of work that establishes expertise. Each post becomes a permanent asset working for you 24/7.

## Start Small

You don't need to write a masterpiece. Start with a TIL (Today I Learned) post. Document a bug you fixed. Explain a pattern you discovered. Ship it imperfect — consistency beats perfection.

## The Secret Benefit

Writing forces you to structure your thoughts. That same skill makes you better at code reviews, design docs, and technical discussions. Writing is thinking made visible.`;

const monoLabel: React.CSSProperties = {
  fontFamily: "var(--font-geist-mono)",
  fontSize: "10.5px",
  letterSpacing: "0.08em",
  lineHeight: 1,
};

const MAX_TWEET = 280;

export default function ThreadPage() {
  const { t } = useI18n();
  const [markdown, setMarkdown] = useState(defaultMarkdown);
  const [copied, setCopied] = useState<number | null>(null);
  const [aiThreads, setAiThreads] = useState<string[] | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"manuscript" | "preview">("manuscript");

  const isDesktop = useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia("(min-width: 768px)");
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia("(min-width: 768px)").matches,
    () => true,
  );

  const ruleThreads = splitThread(markdown);
  const threads = aiThreads ?? ruleThreads;
  const words = markdown.split(/\s+/).filter(Boolean).length;

  const copyTweet = useCallback(async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    trackEvent("copy_tweet");
    setCopied(index);
    setTimeout(() => setCopied(null), 1500);
  }, []);

  const copyAll = useCallback(async () => {
    const full = threads.join("\n\n---\n\n");
    await navigator.clipboard.writeText(full);
    trackEvent("copy_all_tweets");
    setCopied(-1);
    setTimeout(() => setCopied(null), 1500);
  }, [threads]);

  const handleAiSplit = useCallback(async () => {
    if (!markdown.trim()) return;
    setAiLoading(true);
    setAiError(null);
    trackEvent("thread_split");
    try {
      const res = await fetch("/api/thread-split", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markdown }),
      });
      if (!res.ok) {
        if (res.status === 429) throw new Error(t.rateLimitError);
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data.tweets && Array.isArray(data.tweets)) {
        // Add numbering
        const total = data.tweets.length;
        setAiThreads(data.tweets.map((t: string, i: number) => `${t} ${i + 1}/${total}`));
      }
    } catch (err: unknown) {
      setAiError(err instanceof Error ? err.message : "AI split failed");
    } finally {
      setAiLoading(false);
    }
  }, [markdown, t.rateLimitError]);

  const handleReset = useCallback(() => {
    setAiThreads(null);
    setAiError(null);
  }, []);

  const ghostBtn =
    "inline-flex h-8 items-center gap-[6px] rounded-[var(--radius-sm)] border border-[var(--border-struct)] px-[10px] text-[12.5px] font-medium text-[var(--muted)] transition-colors hover:border-[var(--fg)] hover:text-[var(--fg)] disabled:opacity-50 disabled:cursor-not-allowed";
  const primaryBtn =
    "inline-flex h-8 flex-1 items-center justify-center gap-[6px] rounded-[var(--radius-sm)] text-[13px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="workbench flex h-full flex-col bg-[var(--bg)]">
      {/* ═══ Global Header ═══ */}
      <AppHeader activePage="thread" />

      {/* ═══ Toolbar — 44px ═══ */}
      <div className="wb-toolbar flex h-11 shrink-0 items-center justify-between gap-2 border-b border-[var(--border)] bg-[var(--surface)] pl-2 pr-2 md:pl-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex items-center gap-[6px] px-2 text-[12.5px] font-medium text-[var(--fg)]">
            <span
              aria-hidden="true"
              className="inline-block h-[6px] w-[6px] rounded-full"
              style={{ background: "var(--success)" }}
            />
            {aiThreads ? t.threadSourceAi : t.threadSourceRules}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {aiThreads && (
            <button type="button" onClick={handleReset} className={ghostBtn}>
              <RotateCcw size={13} strokeWidth={1.6} aria-hidden="true" />
              {t.threadResetToRules}
            </button>
          )}
          <button
            type="button"
            onClick={handleAiSplit}
            disabled={aiLoading || !markdown.trim()}
            className={ghostBtn}
          >
            <Sparkles size={13} strokeWidth={1.6} aria-hidden="true" />
            {aiLoading ? t.threadSplitting : t.threadAiSplit}
          </button>
          <button
            type="button"
            onClick={copyAll}
            className="hidden md:inline-flex h-8 items-center gap-[6px] rounded-[var(--radius-sm)] bg-[var(--fg)] px-[12px] text-[13px] font-semibold text-[var(--bg)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--on-accent)]"
          >
            <Copy size={13} strokeWidth={1.6} aria-hidden="true" />
            {copied === -1 ? t.threadCopied : t.threadCopyAll}
          </button>
        </div>
      </div>

      {/* ═══ Mobile: manuscript / preview tab strip ═══ */}
      {!isDesktop && (
        <div className="flex h-11 shrink-0 border-b border-[var(--border)] bg-[var(--surface)]" role="tablist" aria-label={t.threadTweetPreview}>
          {(
            [
              { id: "manuscript", label: t.manuscript },
              { id: "preview", label: t.threadTweetPreview },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={mobileView === tab.id}
              onClick={() => setMobileView(tab.id)}
              className="relative h-11 flex-1 text-[14px] font-medium transition-colors"
              style={{ color: mobileView === tab.id ? "var(--fg)" : "var(--muted)" }}
            >
              {tab.label}
              <span
                aria-hidden="true"
                className="absolute left-0 right-0 bottom-0 h-[2px] mx-auto w-16 transition-transform"
                style={{
                  background: "var(--accent)",
                  transform: mobileView === tab.id ? "scaleX(1)" : "scaleX(0)",
                }}
              />
            </button>
          ))}
        </div>
      )}

      {/* ═══ Main: manuscript + preview ═══ */}
      <main
        className="grid min-h-0 flex-1 overflow-hidden"
        style={{
          gridTemplateColumns: isDesktop ? "1fr 1px 1fr" : "100%",
        }}
      >
        {/* Left: manuscript */}
        <div
          className={`flex min-w-0 flex-col overflow-hidden bg-[var(--surface)] ${
            !isDesktop && mobileView !== "manuscript" ? "hidden" : ""
          }`}
        >
          <div className="wb-colhead hidden h-[30px] shrink-0 items-center justify-between border-b border-[var(--border)] px-4 md:flex">
            <span className="flex items-baseline gap-[6px]" style={{ ...monoLabel, color: "var(--fg)" }}>
              {t.manuscript}
              <span className="text-[var(--muted)]">· MARKDOWN</span>
            </span>
            <span
              className="tabular-nums text-[var(--muted)]"
              style={{ fontFamily: "var(--font-geist-mono)", fontSize: "10.5px", letterSpacing: "0.02em", lineHeight: 1 }}
            >
              {words} {t.footerWords} · {markdown.length} {t.footerChars}
            </span>
          </div>
          <textarea
            className="thread-input flex-1 resize-none bg-[var(--surface)] p-4 font-mono text-[13.5px] leading-[23px] text-[var(--fg)] focus:outline-none"
            placeholder={t.threadPlaceholder}
            value={markdown}
            onChange={(e) => {
              setMarkdown(e.target.value);
              setAiThreads(null);
              setAiError(null);
            }}
          />
        </div>

        {/* 1px column divider */}
        {isDesktop && <div className="w-px bg-[var(--border-struct)]" aria-hidden="true" />}

        {/* Right: tweet preview — X reading surface */}
        <div
          className={`flex min-w-0 flex-col overflow-hidden ${
            !isDesktop && mobileView !== "preview" ? "hidden" : ""
          }`}
          style={{ background: "var(--x-bg)" }}
        >
          <div className="wb-colhead hidden h-[30px] shrink-0 items-center justify-between border-b border-[var(--border)] px-4 md:flex" style={{ background: "var(--surface)" }}>
            <span className="flex items-center gap-[6px]" style={{ ...monoLabel, color: "var(--fg)" }}>
              <span
                aria-hidden="true"
                className="inline-block h-[6px] w-[6px] rounded-full"
                style={{ background: "var(--success)" }}
              />
              {t.threadTweetPreview}
            </span>
            <span
              className="tabular-nums text-[var(--muted)]"
              style={{ fontFamily: "var(--font-geist-mono)", fontSize: "10.5px", letterSpacing: "0.02em", lineHeight: 1 }}
            >
              {threads.length} {threads.length !== 1 ? t.threadTweets : t.threadTweet}
            </span>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {aiError && (
              <div
                className="rounded-[var(--radius)] border p-3 text-xs"
                style={{ borderColor: "var(--danger)", color: "var(--danger)" }}
              >
                {aiError}
              </div>
            )}
            {threads.length === 0 ? (
              <p className="px-6 py-16 text-center text-[14px]" style={{ color: "var(--x-muted)" }}>
                {t.threadEmpty}
              </p>
            ) : (
              threads.map((tweet, i) => {
                const over = tweet.length > MAX_TWEET;
                return (
                  <div
                    key={i}
                    className="group rounded-[var(--radius-lg)] border p-4"
                    style={{ background: "var(--x-bg)", borderColor: "var(--x-line)" }}
                  >
                    <p
                      className="whitespace-pre-wrap"
                      style={{
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
                        fontSize: "15px",
                        lineHeight: "20px",
                        color: "var(--x-fg)",
                      }}
                    >
                      {tweet}
                    </p>
                    <div
                      className="mt-3 flex items-center justify-between border-t pt-2"
                      style={{ borderColor: "var(--x-line)" }}
                    >
                      <span
                        className="tabular-nums text-[12px]"
                        style={{
                          color: over ? "var(--accent)" : "var(--x-muted)",
                          fontFamily: "var(--font-geist-mono)",
                        }}
                      >
                        {i + 1}/{threads.length} · {tweet.length} {t.threadChars}
                        {over ? ` · ${t.threadOverLimit}` : ""}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyTweet(tweet, i)}
                        className="thread-copy-btn rounded-[var(--radius-sm)] border border-[var(--border-struct)] px-2 py-0.5 text-[11px] text-[var(--muted)] transition-opacity hover:text-[var(--fg)] md:opacity-0 md:group-hover:opacity-100"
                        aria-label={copied === i ? t.threadCopied : t.threadCopy}
                      >
                        {copied === i ? (
                          <span className="inline-flex items-center gap-1">
                            <Check size={11} strokeWidth={1.8} aria-hidden="true" />
                            {t.threadCopied}
                          </span>
                        ) : (
                          t.threadCopy
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      {/* ═══ Mobile bottom action bar — 60px ═══ */}
      {!isDesktop && (
        <div
          className="wb-mobile-actions flex h-[60px] shrink-0 items-center gap-2 border-t px-3"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          <button type="button" onClick={copyAll} className={ghostBtn}>
            <Copy size={13} strokeWidth={1.6} aria-hidden="true" />
            {copied === -1 ? t.threadCopied : t.threadCopyAll}
          </button>
          <button
            type="button"
            onClick={handleAiSplit}
            disabled={aiLoading || !markdown.trim()}
            className={primaryBtn}
            style={{ background: "var(--fg)", color: "var(--bg)" }}
          >
            <Sparkles size={13} strokeWidth={1.6} aria-hidden="true" />
            {aiLoading ? t.threadSplitting : t.threadAiSplit}
          </button>
        </div>
      )}
    </div>
  );
}
