# Performance Testing Guide

This document outlines how to validate the performance metrics for the Microblog CMS.

## Prerequisites

- Node.js 18+ installed
- pnpm installed
- Chrome or Chromium browser
- Development server running (`pnpm dev`)

## Performance Metrics Checklist

### T109: Lighthouse Audit (Mobile)

**Target**: Score > 80 on mobile

**How to test**:

1. Open Chrome DevTools (F12)
2. Navigate to the Lighthouse tab
3. Select "Mobile" device
4. Check "Performance" category
5. Click "Analyze page load"
6. Verify score is > 80

**Command line alternative**:

```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run audit on homepage
lighthouse http://localhost:3000 --only-categories=performance --form-factor=mobile --output=html --output-path=./lighthouse-report.html

# Open the report
open lighthouse-report.html
```

### T110: Markdown Render Performance

**Target**: < 50ms for 500-word post

**How to test**:

```bash
# Run unit tests
pnpm test tests/unit/markdown-performance.test.ts

# Check console output for render time
```

### T111: Throttled 3G Load Time

**Target**: < 3s initial load

**How to test**:

1. Open Chrome DevTools (F12)
2. Go to Network tab
3. Select "Slow 3G" from throttling dropdown
4. Reload the page (Cmd+R / Ctrl+R)
5. Check the DOMContentLoaded time in the Network tab
6. Verify it's < 3000ms

**Command line alternative**:

```bash
# Using Lighthouse with 3G throttling
lighthouse http://localhost:3000 --throttling-method=devtools --throttling.cpuSlowdownMultiplier=4 --output=html
```

### T112: API Response Time

**Target**: p95 < 200ms

**How to test locally**:

```bash
# Install Apache Bench (if not already installed)
# On macOS: comes with system
# On Ubuntu: sudo apt-get install apache2-utils

# Test GET /api/posts endpoint
ab -n 1000 -c 10 http://localhost:3000/api/posts

# Check the "95%" percentile in the results
# It should be < 200ms
```

**Production monitoring**:

- Use Vercel Analytics dashboard
- Check the "API Routes" section
- Verify p95 response time < 200ms

## Responsive Layout Testing

### T105-T108: Playwright E2E Tests

**How to test**:

```bash
# Install Playwright browsers (first time only)
pnpm exec playwright install

# Run all E2E tests
pnpm test:e2e

# Run only responsive layout tests
pnpm exec playwright test tests/e2e/responsive-layout.spec.ts

# Run with UI mode for debugging
pnpm exec playwright test --ui
```

**Manual testing**:

1. Open Chrome DevTools (F12)
2. Toggle device toolbar (Cmd+Shift+M / Ctrl+Shift+M)
3. Test these viewports:
   - **Desktop**: 1920x1080 (3-column layout)
   - **Tablet**: 768x1024 (2-column layout)
   - **Mobile**: 375x667 (single column + hamburger menu)

### Touch Target Validation (T101)

**Target**: All interactive elements ≥ 44×44px

**How to test**:

1. Open Chrome DevTools
2. Set mobile viewport (375x667)
3. Enable "Show rulers" in Settings
4. Hover over interactive elements (buttons, links)
5. Verify dimensions in tooltip are ≥ 44px

**Using Accessibility Inspector**:

1. Chrome DevTools → More tools → Accessibility
2. Select element
3. Check "Size" property
4. Verify width and height ≥ 44px

## Performance Optimization Checklist

### Implemented Optimizations

- ✅ **T096**: Next.js Image component configured (if images used)
- ✅ **T097**: React Server Components for data fetching
- ✅ **T098**: Dynamic imports for heavy components:
  - MarkdownRenderer in PostEditor
  - ModerationQueue in moderation page
- ✅ **T099**: Production optimizations in next.config.ts:
  - Compression enabled
  - Console.log removal in production
  - Package import optimization
- ✅ **T100**: Loading.tsx files for streaming UI:
  - Homepage
  - Post detail page
  - Drafts page
  - Moderation page

### Mobile Optimizations

- ✅ **T102**: Form input types validated
- ✅ **T103**: Viewport meta tag properly configured
- ✅ **T104**: Hamburger menu animations tested

## Running All Tests

```bash
# Run all tests (unit + E2E)
pnpm test

# Run only E2E tests
pnpm test:e2e

# Run only unit tests
pnpm test:unit

# Generate coverage report
pnpm test:coverage
```

## Continuous Monitoring

For production deployments:

1. **Vercel Analytics**: Monitor real-user metrics
2. **Lighthouse CI**: Automate audits in CI/CD
3. **Web Vitals**: Track Core Web Vitals (LCP, FID, CLS)

## Troubleshooting

### Lighthouse Score < 80

- Check bundle size: `pnpm analyze`
- Review Network tab for large assets
- Verify compression is enabled
- Check for render-blocking resources

### Slow API Responses

- Check database query performance
- Verify indexes are created
- Review Supabase query patterns
- Enable caching where appropriate

### Large Bundle Size

- Run `pnpm analyze` to see bundle composition
- Consider more dynamic imports
- Review dependencies for lighter alternatives
- Enable tree-shaking for libraries
