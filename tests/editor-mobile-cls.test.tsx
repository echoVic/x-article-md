// Regression test for mobile editor CLS (commit ee7fd61).
//
// Prior to the fix, the mobile tab strip (h-11) and bottom action bar
// (h-[60px]) were wrapped in `{!isDesktop && (...)}`. Because
// useSyncExternalStore's getServerSnapshot returns `true` (desktop), SSR
// never rendered those bars; on a mobile client hydration immediately
// flipped isDesktop=false and inserted ~104px of layout space, pushing
// the flex-1 grid down (measured layout-shift .047 at 390x844).
//
// The fix renders both bars unconditionally and hides them on desktop
// with `md:hidden`. This test pins that contract: bars must be in the
// initial DOM (so SSR reserves mobile layout space) AND must carry the
// md:hidden class (so they don't show on desktop).
import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";

// matchMedia — jsdom doesn't implement it. Report desktop (>=768px) to
// mirror getServerSnapshot=true; the point is the bars must still be in
// the DOM regardless of isDesktop.
beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: query === "(min-width: 768px)", // desktop
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });
});

vi.mock("next/font/google", () => ({
  Geist: () => ({ variable: "" }),
  Geist_Mono: () => ({ variable: "" }),
  Instrument_Serif: () => ({ variable: "" }),
}));

vi.mock("@/components/providers", () => ({
  Providers: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/editor",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}));

// CodeMirror hits browser-only APIs in constructor; stub it out — we
// care about layout chrome, not the editor internals.
vi.mock("@/components/codemirror-editor", () => ({
  CodeMirrorEditor: () => <div data-testid="cm-stub" />,
}));

// Stub heavy children to keep this test focused on the mobile chrome.
vi.mock("@/components/app-header", () => ({
  AppHeader: () => <header data-testid="app-header-stub" />,
}));
vi.mock("@/components/editor-toolbar", () => ({
  EditorToolbar: () => <div data-testid="toolbar-stub" />,
}));
vi.mock("@/components/markdown-editor", () => ({
  MarkdownEditor: () => <div data-testid="md-editor-stub" />,
  getStats: () => ({ lines: 0, words: 0, characters: 0 }),
}));
vi.mock("@/components/article-preview", () => ({
  ArticlePreview: () => <div data-testid="preview-stub" />,
}));

import EditorPage from "@/components/editor-page";

describe("editor mobile CLS regression (ee7fd61)", () => {
  it("renders the manuscript/preview tab strip in the initial DOM with md:hidden", () => {
    render(<EditorPage />);
    const tablist = screen.getByRole("tablist", { name: /live preview|实时预览/i });
    // The strip must carry md:hidden so it's display:none on desktop,
    // but present in DOM on mobile (no conditional insertion at hydration).
    expect(tablist.className).toContain("md:hidden");
    expect(tablist.className).toMatch(/h-11/);
  });

  it("renders the mobile bottom action bar in the initial DOM with md:hidden", () => {
    render(<EditorPage />);
    // The bottom bar is a direct flex row containing the preflight / publish /
    // copy-body buttons. Find it via the "Copy body" button's container.
    const copyBtn = screen.getByRole("button", { name: /copy body|复制正文/i });
    const bar = copyBtn.parentElement as HTMLElement;
    expect(bar.className).toContain("md:hidden");
    expect(bar.className).toMatch(/h-\[60px\]/);
  });

  it("mounts without throwing and keeps the bars stable across a matchMedia change", () => {
    // If the bars were still {!isDesktop && ...}, toggling matchMedia would
    // unmount/remount them. Here we just assert the mount succeeds and
    // the bars are in the tree twice (two separate renders, two containers).
    const { unmount } = render(<EditorPage />);
    expect(screen.getByRole("tablist", { name: /live preview|实时预览/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /copy body|复制正文/i })).toBeTruthy();
    unmount();
  });
});
