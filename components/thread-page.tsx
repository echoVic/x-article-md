"use client";

import { useState, useCallback } from "react";
import { splitThread } from "@/lib/thread";

const defaultMarkdown = `# Why Every Developer Should Write

Writing clarifies thinking. When you explain a concept in words, you discover gaps in your understanding that code alone never reveals.

## The Compound Effect

A single blog post might get 100 views. But over a year, 50 posts compound into a body of work that establishes expertise. Each post becomes a permanent asset working for you 24/7.

## Start Small

You don't need to write a masterpiece. Start with a TIL (Today I Learned) post. Document a bug you fixed. Explain a pattern you discovered. Ship it imperfect — consistency beats perfection.

## The Secret Benefit

Writing forces you to structure your thoughts. That same skill makes you better at code reviews, design docs, and technical discussions. Writing is thinking made visible.`;

export default function ThreadPage() {
  const [markdown, setMarkdown] = useState(defaultMarkdown);
  const [copied, setCopied] = useState<number | null>(null);
  const [aiThreads, setAiThreads] = useState<string[] | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const ruleThreads = splitThread(markdown);
  const threads = aiThreads ?? ruleThreads;

  const copyTweet = useCallback(async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopied(index);
    setTimeout(() => setCopied(null), 1500);
  }, []);

  const copyAll = useCallback(async () => {
    const full = threads.join("\n\n---\n\n");
    await navigator.clipboard.writeText(full);
    setCopied(-1);
    setTimeout(() => setCopied(null), 1500);
  }, [threads]);

  const handleAiSplit = useCallback(async () => {
    if (!markdown.trim()) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch("/api/thread-split", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markdown }),
      });
      if (!res.ok) {
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
  }, [markdown]);

  const handleReset = useCallback(() => {
    setAiThreads(null);
    setAiError(null);
  }, []);

  return (
    <div className="flex flex-col md:flex-row h-[calc(100dvh-8rem)] border-t border-[var(--border)]">
      {/* Left: Editor */}
      <div className="flex-1 flex flex-col border-r border-[var(--border)] min-w-0">
        <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border)] bg-[var(--surface)]">
          <span className="text-xs font-medium text-[var(--muted)]">Markdown Input</span>
          <div className="flex items-center gap-2">
            {aiThreads && (
              <button
                onClick={handleReset}
                className="text-xs px-2 py-1 rounded-[var(--radius-sm)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--fg-soft)] transition-colors"
              >
                Reset to Rules
              </button>
            )}
            <button
              onClick={handleAiSplit}
              disabled={aiLoading || !markdown.trim()}
              className="text-xs px-2 py-1 rounded-[var(--radius-sm)] border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {aiLoading ? "Splitting..." : "✨ AI Split"}
            </button>
          </div>
        </div>
        <textarea
          className="flex-1 p-4 bg-[var(--bg)] text-[var(--fg)] text-sm font-mono resize-none focus:outline-none"
          placeholder="Paste or write your Markdown here..."
          value={markdown}
          onChange={(e) => {
            setMarkdown(e.target.value);
            setAiThreads(null);
            setAiError(null);
          }}
        />
      </div>

      {/* Right: Thread Preview */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border)] bg-[var(--surface)]">
          <span className="text-xs font-medium text-[var(--muted)]">
            {aiThreads ? "✨ AI" : "Rules"} — {threads.length} tweet{threads.length !== 1 ? "s" : ""}
          </span>
          {threads.length > 1 && (
            <button
              onClick={copyAll}
              className="text-xs px-2 py-1 rounded-[var(--radius-sm)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--fg-soft)] transition-colors"
            >
              {copied === -1 ? "Copied!" : "Copy All"}
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {aiError && (
            <div className="rounded-[var(--radius)] border border-red-400/30 bg-red-400/5 p-3 text-xs text-red-400">
              {aiError}
            </div>
          )}
          {threads.length === 0 ? (
            <p className="text-sm text-[var(--muted)] italic">
              Your thread will appear here...
            </p>
          ) : (
            threads.map((tweet, i) => (
              <div
                key={i}
                className="group relative rounded-[var(--radius)] border border-[var(--border)] p-4 bg-[var(--surface)] hover:border-[var(--accent)] transition-colors"
              >
                <pre className="text-sm text-[var(--fg)] whitespace-pre-wrap font-sans leading-relaxed">
                  {tweet}
                </pre>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--border)]">
                  <span className="text-xs text-[var(--muted)]">
                    {tweet.length} chars
                  </span>
                  <button
                    onClick={() => copyTweet(tweet, i)}
                    className="text-xs px-2 py-0.5 rounded-[var(--radius-sm)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--fg-soft)] transition-colors opacity-0 group-hover:opacity-100"
                  >
                    {copied === i ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
