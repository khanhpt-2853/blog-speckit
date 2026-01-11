<!--
Sync Impact Report - Constitution v1.0.0
────────────────────────────────────────────────────────────────
Version Change: N/A → 1.0.0 (Initial ratification)
Modified Principles: N/A (first version)
Added Sections:
  - Core Principles (I-VI)
  - Technical Standards
  - Content Management Standards
  - Governance

Templates Requiring Updates:
  ✅ plan-template.md - Constitution Check references updated
  ✅ spec-template.md - Alignment verified
  ✅ tasks-template.md - Task categorization aligns with principles

Follow-up TODOs: None
────────────────────────────────────────────────────────────────
-->

# Microblog CMS Constitution

## Core Principles

### I. Content-First Architecture

Every feature MUST serve the primary purpose of creating, organizing, or consuming microblog content. Content models (Post, Tag, Comment) are core entities and MUST remain simple, versioned, and independently testable. Features that do not directly support content creation, tagging, publishing, or commenting require explicit justification.

**Rationale**: Keeps the CMS focused on its primary mission—enabling rapid microblogging without feature bloat.

### II. Mobile-First Responsive Design

All user interfaces MUST be designed mobile-first with responsive breakpoints. Desktop experiences are enhancements, not the baseline. Touch targets MUST meet minimum 44×44px accessibility standards. Performance budgets: <3s initial load on 3G, <100ms interaction response.

**Rationale**: Modern content consumers primarily use mobile devices; mobile-first ensures maximum reach and usability.

### III. Markdown as Content Source of Truth

All post content MUST be stored and processed as Markdown. Rendering to HTML occurs at display time only. Markdown MUST support CommonMark specification with safe HTML sanitization. No rich-text editor lock-in—content remains portable and version-controllable.

**Rationale**: Ensures content longevity, portability, version control compatibility, and prevents vendor lock-in.

### IV. Test-First for User Journeys (NON-NEGOTIABLE)

Every user story MUST have acceptance tests written BEFORE implementation. Tests MUST fail initially, then pass after implementation (Red-Green-Refactor). Focus areas: post draft/publish workflow, tag filtering, comment moderation flow, timeline rendering accuracy.

**Rationale**: Microblog CMS involves complex state transitions (draft→published) and content relationships that are error-prone without disciplined TDD.

### V. Moderation-First Security

User-generated content (comments) MUST pass through moderation gates before public visibility. Default policy: comments pending approval. XSS protection via sanitization MUST be applied to all user input. Rate limiting MUST be implemented for content submission endpoints.

**Rationale**: UGC without moderation invites spam and abuse; security-first prevents reputation damage and legal liability.

### VI. Timeline-Based Information Architecture

Primary navigation MUST be timeline-based (chronological, reverse-chronological). Tag pages provide secondary navigation by topic. Each post MUST have canonical URL. Pagination/infinite scroll MUST maintain URL state for bookmarking and sharing.

**Rationale**: Microblog format relies on temporal ordering; users expect Twitter/Tumblr-style chronological feeds with topic filtering.

## Technical Standards

### Technology Stack

- **Frontend**: HTML5, CSS3 (with CSS Grid/Flexbox for responsive layouts), JavaScript (ES6+)
- **Backend**: Python 3.11+ with FastAPI or Node.js 18+ with Express (to be clarified in plan phase)
- **Database**: PostgreSQL 15+ for relational data (posts, tags, comments with moderation status)
- **Markdown Rendering**: markdown-it (JS) or python-markdown with bleach sanitizer
- **Testing**: pytest (Python) or Jest (JS) for backend; Playwright or Cypress for E2E

### Performance Requirements

- Initial page load: <3 seconds on 3G connection (Lighthouse score >80)
- Time to Interactive (TTI): <5 seconds
- Markdown rendering: <50ms for typical post (500 words)
- API response time: p95 <200ms for content retrieval

### Security Requirements

- All user input MUST be sanitized (XSS prevention via DOMPurify or bleach)
- CSRF protection for state-changing operations
- Rate limiting: 10 posts/hour per user, 30 comments/hour per IP
- Comment moderation MUST default to "pending" status

## Content Management Standards

### Post Lifecycle

- **Draft**: Editable, visible only to author, not included in timelines
- **Published**: Immutable content, visible in timelines, supports comments
- State transition MUST be explicit user action with confirmation

### Tag Management

- Tags MUST be normalized (lowercase, no spaces, hyphen-separated)
- Maximum 5 tags per post
- Tag pages MUST show posts in reverse chronological order

### Comment Moderation

- Default status: Pending
- Moderator actions: Approve, Reject, Flag for Review
- Email notification to author on approval
- Rejected comments stored for audit but never displayed

## Governance

This constitution supersedes all other development practices. Changes to core principles require:

1. Documented rationale for the amendment
2. Impact analysis on existing features
3. Migration plan if breaking changes occur
4. Version bump following semantic versioning (MAJOR.MINOR.PATCH)

All code reviews, pull requests, and feature specifications MUST verify compliance with these principles. Complexity additions MUST be justified against the "Content-First" and "Mobile-First" principles.

For runtime development guidance, refer to `.specify/templates/plan-template.md` and agent prompt files in `.github/prompts/`.

**Version**: 1.0.0 | **Ratified**: 2026-01-11 | **Last Amended**: 2026-01-11
