import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CodeBlock } from "@/components/code-block";
import { MermaidBlock } from "@/components/mermaid-block";
import { I18nProvider, type Locale } from "@/lib/i18n";
import { copyCodeImage, copySvgImage } from "@/lib/image-copy";

const mermaidMock = vi.hoisted(() => ({
  initialize: vi.fn(),
  render: vi.fn(),
}));

vi.mock("mermaid", () => ({ default: mermaidMock }));
vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/lib/image-copy", () => ({
  copyCodeImage: vi.fn(),
  copySvgImage: vi.fn(),
}));

function renderIn(locale: Locale, ui: ReactNode) {
  return render(
    <I18nProvider initialLocale={locale} persistLocale={false}>
      {ui}
    </I18nProvider>,
  );
}

describe("CodeBlock copy button", () => {
  beforeEach(() => {
    vi.mocked(copyCodeImage).mockReset();
  });

  it("uses English copy in the English UI", async () => {
    vi.mocked(copyCodeImage).mockResolvedValue(true);
    renderIn("en", <CodeBlock code="const a = 1;" language="ts" />);

    const button = screen.getByRole("button", { name: "Copy code image" });
    expect(button).toHaveTextContent("Copy Image");

    fireEvent.click(button);
    expect(await screen.findByText("Copied")).toBeInTheDocument();
  });

  it("shows an English failure state in the English UI", async () => {
    vi.mocked(copyCodeImage).mockResolvedValue(false);
    renderIn("en", <CodeBlock code="const a = 1;" language="ts" />);

    fireEvent.click(screen.getByRole("button", { name: "Copy code image" }));
    expect(await screen.findByText("Failed")).toBeInTheDocument();
  });

  it("keeps Chinese copy in the Chinese UI", () => {
    renderIn("zh", <CodeBlock code="const a = 1;" language="ts" />);

    expect(screen.getByRole("button", { name: "复制代码图片" })).toHaveTextContent("复制图片");
  });
});

describe("MermaidBlock", () => {
  beforeEach(() => {
    mermaidMock.initialize.mockReset();
    mermaidMock.render.mockReset();
    vi.mocked(copySvgImage).mockReset();
  });

  it("uses English copy in the English UI", async () => {
    mermaidMock.render.mockResolvedValue({ svg: "<svg></svg>", diagramType: "flowchart" });
    vi.mocked(copySvgImage).mockResolvedValue(true);
    renderIn("en", <MermaidBlock code="graph TD; A-->B" />);

    expect(screen.getByText("Rendering Mermaid diagram...")).toBeInTheDocument();

    const button = await screen.findByRole("button", { name: "Copy Image" });
    fireEvent.click(button);
    expect(await screen.findByText("Copied")).toBeInTheDocument();
  });

  it("shows an English failure state in the English UI", async () => {
    mermaidMock.render.mockResolvedValue({ svg: "<svg></svg>", diagramType: "flowchart" });
    vi.mocked(copySvgImage).mockResolvedValue(false);
    renderIn("en", <MermaidBlock code="graph TD; A-->B" />);

    fireEvent.click(await screen.findByRole("button", { name: "Copy Image" }));
    expect(await screen.findByText("Copy failed")).toBeInTheDocument();
  });

  it("explains a render error in English in the English UI", async () => {
    mermaidMock.render.mockRejectedValue(new Error("Parse error"));
    renderIn("en", <MermaidBlock code="graph TD; A-->" />);

    expect(await screen.findByText("Mermaid preview unavailable")).toBeInTheDocument();
  });

  it("keeps Chinese copy in the Chinese UI", async () => {
    mermaidMock.render.mockResolvedValue({ svg: "<svg></svg>", diagramType: "flowchart" });
    renderIn("zh", <MermaidBlock code="graph TD; A-->B" />);

    expect(screen.getByText("渲染 Mermaid 图表中...")).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: "复制图片" })).toBeInTheDocument();
  });
});
