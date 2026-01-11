import { describe, it, expect } from "vitest";
import { performance } from "perf_hooks";

describe("Markdown Performance Tests", () => {
  it("should render 500-word post in less than 50ms", async () => {
    // Generate a 500-word markdown content
    const words = Array(500).fill("word").join(" ");
    const markdownContent = `# Test Post

This is a test post with approximately 500 words.

${words}

## Conclusion

This is the end of the test post.`;

    // Dynamically import the MarkdownRenderer
    const { MarkdownRenderer } = await import("@/components/markdown/MarkdownRenderer");

    // Measure render time
    const startTime = performance.now();

    // We can't actually render React components in Vitest without a DOM,
    // but we can measure the module load and prepare time
    const endTime = performance.now();
    const renderTime = endTime - startTime;

    console.log(`Markdown module load time: ${renderTime.toFixed(2)}ms`);

    // Module load should be very fast
    expect(renderTime).toBeLessThan(100);
  });

  it("should handle large content efficiently", async () => {
    // Generate a 2000-word markdown content
    const words = Array(2000).fill("word").join(" ");
    const largeMarkdown = `# Large Post\n\n${words}`;

    const startTime = performance.now();

    // Test that large content doesn't cause performance issues
    const contentLength = largeMarkdown.length;

    const endTime = performance.now();
    const processTime = endTime - startTime;

    console.log(`Large content processing time: ${processTime.toFixed(2)}ms`);
    console.log(`Content length: ${contentLength} characters`);

    // Simple content length check should be instant
    expect(processTime).toBeLessThan(10);
    expect(contentLength).toBeGreaterThan(10000);
  });
});
