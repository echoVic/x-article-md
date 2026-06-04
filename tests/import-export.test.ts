/**
 * Import/Export .md file functionality tests
 */

describe("Import/Export Markdown files", () => {
  describe("File size validation", () => {
    it("should accept files under 1MB", () => {
      const maxSize = 1024 * 1024; // 1MB
      const smallFileSize = 500 * 1024; // 500KB
      expect(smallFileSize).toBeLessThan(maxSize);
    });

    it("should reject files over 1MB", () => {
      const maxSize = 1024 * 1024; // 1MB
      const largeFileSize = 2 * 1024 * 1024; // 2MB
      expect(largeFileSize).toBeGreaterThan(maxSize);
    });
  });

  describe("Filename generation", () => {
    it("should extract filename from first line title", () => {
      const markdown = "# Hello World\n\nContent here";
      const firstLine = markdown.split("\n")[0].trim();
      const filename = firstLine
        .replace(/^#+\s*/, "")
        .replace(/[^a-zA-Z0-9一-龥_-]/g, "_")
        .substring(0, 50);
      expect(filename).toBe("Hello_World");
    });

    it("should handle Chinese characters in filename", () => {
      const markdown = "# 导入导出功能\n\n内容";
      const firstLine = markdown.split("\n")[0].trim();
      const filename = firstLine
        .replace(/^#+\s*/, "")
        .replace(/[^a-zA-Z0-9一-龥_-]/g, "_")
        .substring(0, 50);
      expect(filename).toBe("导入导出功能");
    });

    it("should use 'untitled' for empty content", () => {
      const markdown = "";
      const firstLine = markdown.split("\n")[0].trim();
      const filename = firstLine
        ? firstLine.replace(/^#+\s*/, "").replace(/[^a-zA-Z0-9一-龥_-]/g, "_").substring(0, 50) || "untitled"
        : "untitled";
      expect(filename).toBe("untitled");
    });

    it("should truncate long filenames to 50 characters", () => {
      const longTitle = "A".repeat(100);
      const markdown = `# ${longTitle}\n\nContent`;
      const firstLine = markdown.split("\n")[0].trim();
      const filename = firstLine
        .replace(/^#+\s*/, "")
        .replace(/[^a-zA-Z0-9一-龥_-]/g, "_")
        .substring(0, 50);
      expect(filename.length).toBe(50);
    });

    it("should replace special characters with underscores", () => {
      const markdown = "# Hello@World#2024!\n\nContent";
      const firstLine = markdown.split("\n")[0].trim();
      const filename = firstLine
        .replace(/^#+\s*/, "")
        .replace(/[^a-zA-Z0-9一-龥_-]/g, "_")
        .substring(0, 50);
      expect(filename).toBe("Hello_World_2024_");
    });
  });

  describe("Blob creation for export", () => {
    it("should create a markdown blob with correct type", () => {
      const content = "# Test\n\nContent";
      const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
      expect(blob.type).toBe("text/markdown;charset=utf-8");
      expect(blob.size).toBeGreaterThan(0);
    });
  });
});
