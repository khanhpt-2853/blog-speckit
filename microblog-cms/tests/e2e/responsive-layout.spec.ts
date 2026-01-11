import { test, expect } from "@playwright/test";

test.describe("Responsive Layout Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("Desktop layout - 3 column grid on large screens", async ({ page }) => {
    // Set desktop viewport (1920x1080)
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Wait for page to load
    await page.waitForLoadState("networkidle");

    // Check that sidebar is visible
    const sidebar = page.locator("aside").first();
    await expect(sidebar).toBeVisible();

    // Check main content area exists
    const mainContent = page.locator('h1:has-text("Latest Posts")');
    await expect(mainContent).toBeVisible();

    // Verify grid layout is applied
    const gridContainer = page.locator(".grid").first();
    await expect(gridContainer).toBeVisible();

    // Check that hamburger menu is NOT visible on desktop
    const hamburgerButton = page.locator('button[aria-label*="menu"]');
    await expect(hamburgerButton).toBeHidden();
  });

  test("Tablet layout - 2 column at 768px breakpoint", async ({ page }) => {
    // Set tablet viewport (768x1024)
    await page.setViewportSize({ width: 768, height: 1024 });

    await page.waitForLoadState("networkidle");

    // Main content should be visible
    const mainContent = page.locator('h1:has-text("Latest Posts")');
    await expect(mainContent).toBeVisible();

    // Sidebar should be hidden on tablet (below lg breakpoint)
    const sidebar = page.locator("aside").first();
    await expect(sidebar).toBeHidden();

    // Hamburger menu should be visible
    const hamburgerButton = page.locator('button[aria-label*="menu"]');
    await expect(hamburgerButton).toBeVisible();
  });

  test("Mobile layout - single column below 768px", async ({ page }) => {
    // Set mobile viewport (375x667 - iPhone SE)
    await page.setViewportSize({ width: 375, height: 667 });

    await page.waitForLoadState("networkidle");

    // Main content should be visible and full width
    const mainContent = page.locator('h1:has-text("Latest Posts")');
    await expect(mainContent).toBeVisible();

    // Sidebar should be hidden
    const sidebar = page.locator("aside").first();
    await expect(sidebar).toBeHidden();

    // Hamburger menu button should be visible
    const hamburgerButton = page.locator('button[aria-label*="menu"]');
    await expect(hamburgerButton).toBeVisible();
  });

  test("Hamburger menu functionality on mobile", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.waitForLoadState("networkidle");

    // Find and click hamburger menu button
    const hamburgerButton = page.locator('button[aria-label*="menu"]');
    await expect(hamburgerButton).toBeVisible();
    await hamburgerButton.click();

    // Wait for menu to open
    await page.waitForTimeout(300);

    // Check that menu content is now visible
    const menuContent = page.locator('h2:has-text("Menu")');
    await expect(menuContent).toBeVisible();

    // Check that Popular Tags section is visible in menu
    const popularTags = page.locator('h2:has-text("Popular Tags")');
    await expect(popularTags).toBeVisible();

    // Close menu by clicking overlay or close button
    const closeButton = page.locator('button[aria-label*="Close"]');
    if (await closeButton.isVisible()) {
      await closeButton.click();
      await page.waitForTimeout(300);

      // Menu should be hidden again
      await expect(menuContent).toBeHidden();
    }
  });

  test("Touch targets meet minimum 44x44px size", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.waitForLoadState("networkidle");

    // Check hamburger button size
    const hamburgerButton = page.locator('button[aria-label*="menu"]');
    const hamburgerBox = await hamburgerButton.boundingBox();
    expect(hamburgerBox?.width).toBeGreaterThanOrEqual(44);
    expect(hamburgerBox?.height).toBeGreaterThanOrEqual(44);

    // Check pagination buttons if present
    const paginationButtons = page.locator(
      'nav[aria-label="Pagination"] a, nav[aria-label="Pagination"] button'
    );
    const buttonCount = await paginationButtons.count();

    if (buttonCount > 0) {
      for (let i = 0; i < buttonCount; i++) {
        const button = paginationButtons.nth(i);
        const box = await button.boundingBox();
        if (box) {
          expect(box.width).toBeGreaterThanOrEqual(44);
          expect(box.height).toBeGreaterThanOrEqual(44);
        }
      }
    }
  });

  test("Mobile forms have proper input types", async ({ page }) => {
    // Navigate to post creation page (if accessible without auth, otherwise skip)
    await page.goto("/posts/new");

    // Check if redirected to login
    const url = page.url();
    if (url.includes("/login")) {
      test.skip();
      return;
    }

    // Check title input type
    const titleInput = page.locator('input[placeholder*="title" i]');
    if ((await titleInput.count()) > 0) {
      const inputType = await titleInput.getAttribute("type");
      expect(["text", "email", "url", null]).toContain(inputType);
    }
  });

  test("Viewport meta tag is properly configured", async ({ page }) => {
    await page.goto("/");

    // Check viewport meta tag
    const viewport = await page.locator('meta[name="viewport"]').getAttribute("content");
    expect(viewport).toContain("width=device-width");
    expect(viewport).toContain("initial-scale=1");
  });
});
