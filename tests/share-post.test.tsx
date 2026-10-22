import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SharePostPanel } from "@/components/share-post-panel";
import { I18nProvider } from "@/lib/i18n";
import { buildSharePost, isPublishedArticleUrl } from "@/lib/share-post";

// T3: accepts draft/spoof URLs; T4: copies template instead of edits or hides failure.
describe("share post", () => {
  it("only accepts public X URLs and never invents a link for empty inputs", () => {
    for (const value of ["", "javascript:alert(1)", "https://x.com.evil.test/a/status/1", "https://x.com/compose/articles/edit/123", "https://x.com@evil.test/a/status/1", "http://x.com/a/status/1"]) {
      expect(isPublishedArticleUrl(value)).toBe(false);
      expect(buildSharePost("Title", value, "en")).toBe("");
    }
    for (const value of ["https://x.com/a/status/123?s=20", "https://x.com/i/article/123", "https://twitter.com/a/status/123"]) {
      expect(isPublishedArticleUrl(value)).toBe(true);
      expect(buildSharePost("Title", value, "zh")).toBe(`刚写了一篇文章：Title\n\n全文：${value}`);
    }
    expect(buildSharePost("", "https://x.com/a/status/1", "en")).toBe("");
  });

  it("copies edited text, shows a recoverable clipboard error, and resets on URL change", async () => {
    const writeText = vi.fn().mockRejectedValueOnce(new Error("denied")).mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    render(<I18nProvider initialLocale="zh" persistLocale={false}><SharePostPanel title="Test" /></I18nProvider>);
    expect(screen.getByRole("button", { name: "复制推文" })).toBeDisabled();
    fireEvent.change(screen.getByLabelText("已发布文章链接"), { target: { value: "https://x.com/me/status/123" } });
    fireEvent.change(screen.getByLabelText("推文草稿"), { target: { value: "My own wording" } });
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "复制推文" })); });
    expect(screen.getByRole("status")).toHaveTextContent("复制被阻止");
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "复制推文" })); });
    expect(writeText).toHaveBeenLastCalledWith("My own wording");
    expect(screen.getByRole("button", { name: "已复制" })).toBeEnabled();
    fireEvent.change(screen.getByLabelText("已发布文章链接"), { target: { value: "https://x.com/me/status/456" } });
    expect(screen.getByLabelText("推文草稿")).toHaveValue("刚写了一篇文章：Test\n\n全文：https://x.com/me/status/456");
  });

  // T13: a late clipboard result must not label newly edited text as copied.
  it("ignores a late copy result after editing and allows a fresh copy", async () => {
    let done!: () => void;
    const writeText = vi.fn().mockImplementationOnce(() => new Promise<void>(resolve => { done = resolve; })).mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    render(<SharePostPanel title="Title" />);
    fireEvent.change(screen.getByLabelText("Published article URL"), { target: { value: "https://x.com/me/status/123" } });
    fireEvent.click(screen.getByRole("button", { name: "Copy post" }));
    fireEvent.change(screen.getByLabelText("Post draft"), { target: { value: "New text" } });
    await act(async () => { done(); });
    expect(screen.queryByRole("button", { name: "Copied" })).not.toBeInTheDocument();
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Copy post" })); });
    expect(writeText).toHaveBeenLastCalledWith("New text");
  });
});
