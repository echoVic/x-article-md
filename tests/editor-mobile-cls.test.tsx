// Regression test for mobile editor CLS (commit ee7fd61).
//
// Prior to the fix, the mobile tab strip (h-11) and bottom action bar
// (h-[60px]) were wrapped in `{!isDesktop && (...)}`. Because
// useSyncExternalStore's getServerSnapshot returns `true` (desktop), SSR
// never rendered those bars; on a mobile client hydration immediately
// flipped isDesktop=false and inserted ~104px of layout space, pushing
// the flex-1 grid down. Lighthouse 13.5 mobile (412x823, slow 4G, 4x CPU)
// measured a single layout-shift entry at top=136, bottom=763, height=627,
// CLS ≈ 0.047 on /editor and /zh/editor.
//
// The fix renders both bars unconditionally and hides them on desktop
// with `md:hidden`. This test pins that contract: bars must be in the
// initial DOM (so SSR reserves mobile layout space) AND must carry the
// md:hidden class (so they don't show on desktop).
import { act, render, screen } from "@testing-library/react";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

// Controllable matchMedia. We start on desktop (>=768px matches) to
// mirror getServerSnapshot=true, then fire a change event to flip to
// mobile. The bars must NOT unmount/remount in that transition.
let currentMatches = true;
let changeListener: ((ev: { matches: boolean }) => void) | null = null;

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      get matches() { return currentMatches && query === "(min-width: 768px)"; },
      media: query,
      onchange: null,
      addEventListener: (_ev: string, cb: (ev: { matches: boolean }) => void) => { changeListener = cb; },
      removeEventListener: () => { changeListener = null; },
      addListener: () => {},
      removeListener: () => {},
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
  beforeEach(() => {
    currentMatches = true; // start desktop
  });

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

  it("keeps bar DOM nodes stable while isDesktop flips and grid columns respond", () => {
    // This is the regression that matters: before the fix, flipping
    // isDesktop true→false would UNMOUNT the bars (conditional render)
    // and INSERT them on the next render — that insertion is the CLS.
    // After the fix, the bars are always mounted; only their CSS
    // (md:hidden) toggles, and the main grid's inline gridTemplateColumns
    // reacts to the viewport change.
    render(<EditorPage />);

    const tablistBefore = screen.getByRole("tablist", { name: /live preview|实时预览/i });
    const copyBtnBefore = screen.getByRole("button", { name: /copy body|复制正文/i });
    const barBefore = copyBtnBefore.parentElement as HTMLElement;
    // The workbench's <main> carries the grid inline style.
    const mainEl = tablistBefore.parentElement!.querySelector("main") as HTMLElement;

    // Desktop (initial): grid is 3-track (left pane / resize handle / right pane).
    expect(mainEl.style.gridTemplateColumns).toMatch(/%\s+1px\s+/);

    // Flip to mobile inside act() so React commits synchronously.
    act(() => {
      currentMatches = false;
      changeListener?.({ matches: false });
    });

    // State actually changed: grid collapses to 100% single column.
    expect(mainEl.style.gridTemplateColumns).toBe("100%");

    // Bar DOM nodes are identical — no unmount/remount = no layout-space insertion.
    expect(screen.getByRole("tablist", { name: /live preview|实时预览/i })).toBe(tablistBefore);
    expect(screen.getByRole("button", { name: /copy body|复制正文/i }).parentElement).toBe(barBefore);

    // Flip back to desktop.
    act(() => {
      currentMatches = true;
      changeListener?.({ matches: true });
    });

    expect(mainEl.style.gridTemplateColumns).toMatch(/%\s+1px\s+/);
    expect(screen.getByRole("tablist", { name: /live preview|实时预览/i })).toBe(tablistBefore);
    expect(screen.getByRole("button", { name: /copy body|复制正文/i }).parentElement).toBe(barBefore);
  });
});
