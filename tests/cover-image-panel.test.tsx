import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CoverImagePanel } from "@/components/cover-image-panel";
import { generateCoverImage } from "@/lib/cover-image";

vi.mock("@/lib/cover-image", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/lib/cover-image")>();

  return {
    ...actual,
    generateCoverImage: vi.fn(),
  };
});

describe("CoverImagePanel", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.mocked(generateCoverImage).mockReset();
  });

  it("lets users configure image API settings and generate a cover", async () => {
    vi.mocked(generateCoverImage).mockResolvedValue({
      src: "data:image/png;base64,aW1hZ2U=",
      revisedPrompt: "rewritten",
    });

    render(<CoverImagePanel markdown="# Launch Notes" />);
    fireEvent.click(screen.getByRole("button", { name: /Cover Image/ }));

    fireEvent.change(screen.getByLabelText("API Key"), {
      target: { value: "sk-user" },
    });
    fireEvent.change(screen.getByLabelText("Model"), {
      target: { value: "gpt-image-2-custom" },
    });
    fireEvent.change(screen.getByLabelText("Base URL"), {
      target: { value: "https://api.example.com/v1" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Generate Cover" }));

    await waitFor(() => {
      expect(generateCoverImage).toHaveBeenCalledWith("# Launch Notes", {
        apiKey: "sk-user",
        baseUrl: "https://api.example.com/v1",
        model: "gpt-image-2-custom",
      });
    });
    expect(screen.getByAltText("Generated article cover")).toHaveAttribute(
      "src",
      "data:image/png;base64,aW1hZ2U=",
    );
  });

  it("shows validation errors from cover generation", async () => {
    vi.mocked(generateCoverImage).mockRejectedValue(
      new Error("API Key is required."),
    );

    render(<CoverImagePanel markdown="# Launch Notes" />);
    fireEvent.click(screen.getByRole("button", { name: /Cover Image/ }));

    fireEvent.click(screen.getByRole("button", { name: "Generate Cover" }));

    expect(await screen.findByText("API Key is required.")).toBeVisible();
  });
});
