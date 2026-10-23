import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FocusEditorPage, focusUrl } from "@/components/focus-editor-page";

vi.mock("@/components/editor-page-wrapper", () => ({
  EditorPageWrapper: ({ focus, onFocusChange }: { focus: boolean; onFocusChange: (next: boolean) => void }) => (
    <div data-testid="wrapper" data-focus-mode={focus ? "true" : "false"}>
      <button onClick={() => onFocusChange(!focus)}>{focus ? "Exit focus mode" : "Focus mode"}</button>
      <section hidden={focus}>SEO footer</section>
    </div>
  ),
}));

beforeEach(() => {
  window.history.replaceState({}, "", "/editor?utm=docs#draft");
  document.documentElement.style.overflow = "";
  vi.stubGlobal("scrollY", 420);
  window.scrollTo = vi.fn();
});

describe("focus editor page", () => {
  it("preserves unrelated URL state and restores the page after toggling", async () => {
    render(<FocusEditorPage locale="en" />);
    fireEvent.click(await screen.findByRole("button", { name: "Focus mode" }));
    expect(location.pathname + location.search + location.hash).toBe("/editor?utm=docs&focus=1#draft");
    expect(screen.getByTestId("wrapper")).toHaveAttribute("data-focus-mode", "true");
    expect(screen.queryByText("SEO footer")).not.toBeVisible();
    expect(document.documentElement.style.overflow).toBe("hidden");
    fireEvent.click(screen.getByRole("button", { name: "Exit focus mode" }));
    expect(location.pathname + location.search + location.hash).toBe("/editor?utm=docs#draft");
    expect(screen.getByText("SEO footer")).toBeVisible();
    await waitFor(() => expect(window.scrollTo).toHaveBeenCalledWith({ top: 420 }));
  });

  it("hydrates from focus=1, follows history, and lets dialogs consume Escape first", async () => {
    window.history.replaceState({}, "", "/zh/editor?focus=1");
    render(<FocusEditorPage locale="zh" />);
    expect(await screen.findByRole("button", { name: "Exit focus mode" })).toBeInTheDocument();
    const dialog = document.createElement("div"); dialog.setAttribute("role", "dialog"); document.body.append(dialog);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.getByTestId("wrapper")).toHaveAttribute("data-focus-mode", "true");
    dialog.remove();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.getByTestId("wrapper")).toHaveAttribute("data-focus-mode", "false");
    expect(location.search).toBe("");
    window.history.pushState({}, "", "/zh/editor?focus=1");
    fireEvent.popState(window);
    expect(await screen.findByRole("button", { name: "Exit focus mode" })).toBeInTheDocument();
  });

  it("exits focus on the first Escape when the toolbar button stays focused and a Radix tooltip layer swallows the keydown", async () => {
    render(<FocusEditorPage locale="en" />);
    const enterButton = await screen.findByRole("button", { name: "Focus mode" });
    enterButton.focus();

    // Real event order: the trigger button keeps focus after being clicked, and the
    // Radix Tooltip/DismissableLayer mounts while the button is focused — i.e. its
    // bubble-phase document Escape listener registers BEFORE focus mode's own
    // listener. Previously it preventDefault()ed the first Escape and focus mode only
    // exited on the second press.
    const radixTooltipLayer = vi.fn((event: KeyboardEvent) => {
      if (event.key === "Escape") event.preventDefault();
    });
    document.addEventListener("keydown", radixTooltipLayer);

    fireEvent.click(enterButton);
    expect(document.activeElement).toBe(enterButton);
    expect(screen.getByTestId("wrapper")).toHaveAttribute("data-focus-mode", "true");

    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.getByTestId("wrapper")).toHaveAttribute("data-focus-mode", "false");
    expect(location.search).toBe("?utm=docs");
    expect(document.documentElement.style.overflow).toBe("");
    // The event still reached the tooltip layer — overlay Escape handling is not broken.
    expect(radixTooltipLayer).toHaveBeenCalled();

    document.removeEventListener("keydown", radixTooltipLayer);
  });
});

describe("focusUrl", () => {
  it("only changes the focus parameter", () => {
    expect(focusUrl("https://markdown2x.com/editor?a=1#x", true)).toBe("/editor?a=1&focus=1#x");
    expect(focusUrl("https://markdown2x.com/editor?a=1&focus=0#x", false)).toBe("/editor?a=1#x");
  });
});
