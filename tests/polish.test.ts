import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/polish/route";
import { NextRequest } from "next/server";

// Mock the AI SDK
vi.mock("ai", () => ({
  generateText: vi.fn(),
}));

// Mock the DeepSeek provider
vi.mock("@ai-sdk/deepseek", () => ({
  createDeepSeek: vi.fn(() => vi.fn()),
}));

// Mock rate limit
vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn(async () => ({ limited: false })),
}));

describe("Polish API", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.env.DEEPSEEK_API_KEY = "test-api-key";
  });

  describe("Request validation", () => {
    it("should reject requests without text field", async () => {
      const request = new NextRequest("http://localhost:3000/api/polish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("text field is required");
    });

    it("should reject requests with non-string text", async () => {
      const request = new NextRequest("http://localhost:3000/api/polish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: 123 }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("text field is required");
    });

    it("should accept valid text with different styles", async () => {
      const { generateText } = await import("ai");
      vi.mocked(generateText).mockResolvedValue({
        text: "Polished text",
        usage: { promptTokens: 10, completionTokens: 10, totalTokens: 20 },
        finishReason: "stop",
        warnings: [],
      });

      const styles = ["concise", "professional", "casual", "engaging"];

      for (const style of styles) {
        const request = new NextRequest("http://localhost:3000/api/polish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: "Test text",
            style,
          }),
        });

        const response = await POST(request);
        expect(response.status).toBe(200);
      }
    });
  });

  describe("API key handling", () => {
    it("should reject requests without API key", async () => {
      delete process.env.DEEPSEEK_API_KEY;
      delete process.env.OPENAI_API_KEY;

      const request = new NextRequest("http://localhost:3000/api/polish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "Test text" }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toContain("No API key configured");
    });

    it("should accept API key from request body", async () => {
      delete process.env.DEEPSEEK_API_KEY;
      delete process.env.OPENAI_API_KEY;

      const { generateText } = await import("ai");
      vi.mocked(generateText).mockResolvedValue({
        text: "Polished text",
        usage: { promptTokens: 10, completionTokens: 10, totalTokens: 20 },
        finishReason: "stop",
        warnings: [],
      });

      const request = new NextRequest("http://localhost:3000/api/polish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: "Test text",
          apiKey: "custom-api-key",
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    });
  });

  describe("Text polishing", () => {
    it("should return polished text", async () => {
      const { generateText } = await import("ai");
      vi.mocked(generateText).mockResolvedValue({
        text: "This is polished text",
        usage: { promptTokens: 10, completionTokens: 10, totalTokens: 20 },
        finishReason: "stop",
        warnings: [],
      });

      const request = new NextRequest("http://localhost:3000/api/polish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: "This is original text",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.polishedText).toBe("This is polished text");
    });

    it("should handle markdown formatting", async () => {
      const { generateText } = await import("ai");
      vi.mocked(generateText).mockResolvedValue({
        text: "This is **bold** and `code`",
        usage: { promptTokens: 10, completionTokens: 10, totalTokens: 20 },
        finishReason: "stop",
        warnings: [],
      });

      const request = new NextRequest("http://localhost:3000/api/polish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: "This is **bold** and `code`",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.polishedText).toContain("**bold**");
      expect(data.polishedText).toContain("`code`");
    });

    it("should apply style-specific instructions", async () => {
      const { generateText } = await import("ai");
      vi.mocked(generateText).mockResolvedValue({
        text: "Brief text",
        usage: { promptTokens: 10, completionTokens: 10, totalTokens: 20 },
        finishReason: "stop",
        warnings: [],
      });

      const request = new NextRequest("http://localhost:3000/api/polish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: "This is a very long and verbose text with many unnecessary words",
          style: "concise",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(vi.mocked(generateText)).toHaveBeenCalled();

      const callArgs = vi.mocked(generateText).mock.calls[0][0];
      expect(callArgs.system).toContain("concise");
    });
  });

  describe("Error handling", () => {
    it("should handle AI generation errors", async () => {
      const { generateText } = await import("ai");
      vi.mocked(generateText).mockRejectedValue(new Error("AI service unavailable"));

      const request = new NextRequest("http://localhost:3000/api/polish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: "Test text",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("AI service unavailable");
    });

    it("should handle rate limit", async () => {
      const { checkRateLimit } = await import("@/lib/rate-limit");
      vi.mocked(checkRateLimit).mockResolvedValue({
        limited: true,
        response: new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
        }),
      });

      const request = new NextRequest("http://localhost:3000/api/polish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: "Test text",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error).toBe("Rate limit exceeded");
    });
  });

  describe("Configuration options", () => {
    it("should use custom model when provided", async () => {
      const { generateText } = await import("ai");
      const { createDeepSeek } = await import("@ai-sdk/deepseek");

      vi.mocked(generateText).mockResolvedValue({
        text: "Polished text",
        usage: { promptTokens: 10, completionTokens: 10, totalTokens: 20 },
        finishReason: "stop",
        warnings: [],
      });

      const mockProvider = vi.fn();
      vi.mocked(createDeepSeek).mockReturnValue(mockProvider);

      const request = new NextRequest("http://localhost:3000/api/polish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: "Test text",
          model: "custom-model",
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
      expect(mockProvider).toHaveBeenCalledWith("custom-model");
    });

    it("should use custom base URL when provided", async () => {
      const { generateText } = await import("ai");
      const { createDeepSeek } = await import("@ai-sdk/deepseek");

      vi.mocked(generateText).mockResolvedValue({
        text: "Polished text",
        usage: { promptTokens: 10, completionTokens: 10, totalTokens: 20 },
        finishReason: "stop",
        warnings: [],
      });

      const request = new NextRequest("http://localhost:3000/api/polish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: "Test text",
          baseUrl: "https://custom.api.com",
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
      expect(createDeepSeek).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: "https://custom.api.com",
        })
      );
    });
  });
});
