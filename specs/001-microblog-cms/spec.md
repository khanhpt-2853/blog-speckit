# Feature Specification: Microblog CMS

**Feature Branch**: `001-microblog-cms`
**Created**: 2026-01-11
**Status**: Draft
**Input**: User description: "Personal blog website with markdown posts, draft/publish, tags, comments, likes, 3-column layout with responsive mobile design"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Author Creates and Publishes Post (Priority: P1)

An author writes a new blog post using Markdown syntax, previews the rendered content, saves it as a draft for later editing, and eventually publishes it to make it publicly visible on the timeline.

**Why this priority**: Core content creation is the primary function of a microblog CMS. Without the ability to write and publish posts, the platform has no value. This represents the minimum viable product.

**Independent Test**: Can be fully tested by creating a post with Markdown content, saving as draft, verifying it's not publicly visible, editing it, then publishing and confirming it appears on the public timeline with proper Markdown rendering.

**Acceptance Scenarios**:

1. **Given** an authenticated author is on the create post page, **When** they write content in Markdown and click "Save Draft", **Then** the post is saved with status "draft" and not visible on public timeline
2. **Given** an author has a draft post, **When** they click "Edit" and modify the content, **Then** the changes are saved to the draft without creating a new post
3. **Given** an author has a draft post, **When** they click "Publish" and confirm the action, **Then** the post status changes to "published" and appears on the public timeline with Markdown rendered to HTML
4. **Given** an author is writing a post, **When** they use Markdown syntax (headers, links, code blocks, lists), **Then** the preview pane shows the correctly rendered HTML
5. **Given** an author has published a post, **When** they attempt to edit it, **Then** the system prevents modification (published posts are immutable)

---

### User Story 2 - Author Organizes Posts with Tags (Priority: P2)

An author assigns one or more tags to their posts during creation to categorize content by topic, making posts discoverable through tag-based navigation.

**Why this priority**: Tagging is essential for content organization and discovery in a microblog. It's the second most important feature after basic publishing, as it enables content navigation beyond chronological order.

**Independent Test**: Can be tested by creating posts with various tags, verifying tags are normalized (lowercase, hyphenated), and confirming posts appear on tag-specific pages.

**Acceptance Scenarios**:

1. **Given** an author is creating a post, **When** they add tags separated by commas (e.g., "JavaScript, Web Dev, Tutorial"), **Then** each tag is normalized to lowercase-hyphenated format (javascript, web-dev, tutorial) and associated with the post
2. **Given** an author tries to add more than 5 tags, **When** they submit the post, **Then** the system displays a validation error requiring tag count ≤ 5
3. **Given** an author adds tags with mixed case and spaces, **When** the post is saved, **Then** tags are automatically normalized (e.g., "Machine Learning" → "machine-learning")
4. **Given** a post has tags assigned, **When** the post is displayed, **Then** each tag is shown as a clickable link to the tag's dedicated page
5. **Given** multiple posts share the same tag, **When** a user navigates to that tag page, **Then** all posts with that tag are listed in reverse chronological order

---

### User Story 3 - Reader Browses and Filters Content (Priority: P3)

A reader visits the blog homepage to see the latest posts in chronological order, uses tag filters to find posts on specific topics, and can navigate by publication date.

**Why this priority**: Content discovery is critical for reader engagement but depends on having published posts (P1) and tags (P2). This represents the third layer of value delivery.

**Independent Test**: Can be tested by publishing multiple posts with different tags and dates, then verifying timeline displays posts chronologically, tag filtering works correctly, and responsive layout adapts to mobile screens.

**Acceptance Scenarios**:

1. **Given** a reader visits the homepage, **When** the page loads, **Then** published posts are displayed in reverse chronological order (newest first) in the center column
2. **Given** a reader is viewing the timeline, **When** they click a tag in the right sidebar filter, **Then** the timeline updates to show only posts with that tag
3. **Given** a reader is on a mobile device (screen width < 768px), **When** they view the homepage, **Then** the layout switches to single-column with collapsible navigation and filters
4. **Given** multiple posts exist with publication dates, **When** a reader uses the date filter, **Then** posts from the selected date range are displayed
5. **Given** a reader is viewing the homepage, **When** there are more than 10 posts, **Then** pagination or infinite scroll is available while maintaining URL state for bookmarking

---

### User Story 4 - Reader Engages with Posts via Comments and Likes (Priority: P4)

A reader can like posts they enjoy and leave comments to engage in discussion. Comments require moderation approval before becoming visible to prevent spam.

**Why this priority**: Engagement features enhance community building but are not essential for the core content publishing and browsing experience. This represents an enhancement layer.

**Independent Test**: Can be tested by submitting comments (which remain pending), moderating them to approved status, and verifying like counts increment correctly.

**Acceptance Scenarios**:

1. **Given** a reader is viewing a published post, **When** they click the "Like" button, **Then** the like count increments by 1 and the button shows as "Liked"
2. **Given** a reader has already liked a post, **When** they click "Like" again, **Then** the like is removed and the count decrements by 1
3. **Given** a reader is viewing a published post, **When** they submit a comment, **Then** the comment is saved with status "pending" and not immediately visible to other readers
4. **Given** a moderator views pending comments, **When** they approve a comment, **Then** the comment becomes visible on the post and the author receives an email notification
5. **Given** a reader tries to submit more than 30 comments within an hour, **When** they attempt to submit another comment, **Then** the system displays a rate limit error message

---

### User Story 5 - Responsive Layout and Mobile Experience (Priority: P5)

The blog provides an optimal viewing experience across all devices with a 3-column desktop layout (navbar/info left, posts center, filters right) that adapts to single-column on mobile.

**Why this priority**: Responsive design is essential for accessibility but is implemented throughout all features. This story represents the cross-cutting UI/UX concern rather than standalone functionality.

**Independent Test**: Can be tested by viewing the site on different screen sizes and verifying layout breakpoints, touch target sizes, and performance metrics meet constitution standards.

**Acceptance Scenarios**:

1. **Given** a user visits the site on desktop (screen width ≥ 1024px), **When** the page loads, **Then** the layout displays 3 columns: left sidebar (navbar, user info), center content (posts), right sidebar (filters)
2. **Given** a user visits the site on tablet (768px ≤ width < 1024px), **When** the page loads, **Then** the layout displays 2 columns: main content and collapsible sidebar
3. **Given** a user visits the site on mobile (width < 768px), **When** the page loads, **Then** the layout displays single column with hamburger menu for navigation and bottom sheet for filters
4. **Given** a mobile user is interacting with UI elements, **When** they tap buttons or links, **Then** all touch targets are at least 44×44 pixels
5. **Given** a user on 3G mobile connection, **When** they load the homepage, **Then** the initial page load completes in under 3 seconds with Lighthouse score > 80

---

### Edge Cases

- What happens when a user tries to publish a post with no content or title?
- How does the system handle Markdown with malicious HTML/JavaScript injection attempts?
- What occurs when a tag exceeds maximum character length (e.g., 50 characters)?
- How does pagination behave when posts are added/removed between page loads?
- What happens when a comment contains extremely long text or special characters?
- How does the system handle concurrent edits to the same draft by the same author?
- What occurs when a user rapidly clicks the "Like" button multiple times?
- How does the tag filter UI handle when there are 100+ unique tags?
- What happens when Markdown rendering takes longer than 50ms (performance budget)?
- How does the mobile layout adapt to landscape orientation on tablets?

## Requirements _(mandatory)_

### Functional Requirements

#### Content Creation & Management

- **FR-001**: System MUST allow authenticated authors to create posts with Markdown-formatted content
- **FR-002**: System MUST provide a real-time preview of Markdown-rendered HTML during post creation
- **FR-003**: System MUST allow authors to save posts with status "draft" (not publicly visible)
- **FR-004**: System MUST allow authors to edit draft posts without creating new versions
- **FR-005**: System MUST allow authors to publish draft posts, changing status to "published"
- **FR-006**: System MUST make published posts immutable (no editing after publication)
- **FR-007**: System MUST store post content as Markdown in the database (not pre-rendered HTML)
- **FR-008**: System MUST render Markdown to HTML only at display time
- **FR-009**: System MUST support CommonMark specification for Markdown syntax
- **FR-010**: System MUST sanitize rendered HTML to prevent XSS attacks (strip unsafe tags/attributes)

#### Tag Management

- **FR-011**: System MUST allow authors to assign 1 to 5 tags per post
- **FR-012**: System MUST normalize tags to lowercase with hyphens replacing spaces (e.g., "Machine Learning" → "machine-learning")
- **FR-013**: System MUST reject tags longer than 50 characters
- **FR-014**: System MUST create clickable tag links on each post leading to tag-specific pages
- **FR-015**: System MUST display all posts with a given tag in reverse chronological order on tag pages

#### Content Display & Navigation

- **FR-016**: System MUST display published posts on homepage in reverse chronological order (newest first)
- **FR-017**: System MUST implement pagination or infinite scroll for post listings
- **FR-018**: System MUST maintain URL state for pagination to enable bookmarking and sharing
- **FR-019**: System MUST provide a tag filter in the right sidebar (desktop) for filtering posts by tag
- **FR-020**: System MUST provide a date range filter for viewing posts by publication date
- **FR-021**: System MUST assign each published post a canonical URL (e.g., /posts/{id}/{slug})

#### Comments & Moderation

- **FR-022**: System MUST allow readers to submit comments on published posts
- **FR-023**: System MUST set comment status to "pending" by default upon submission
- **FR-024**: System MUST prevent pending comments from being visible to readers (only moderators)
- **FR-025**: System MUST allow moderators to approve, reject, or flag comments for review
- **FR-026**: System MUST send email notification to post author when their post receives an approved comment
- **FR-027**: System MUST store rejected comments in database for audit but never display them publicly
- **FR-028**: System MUST sanitize comment content to prevent XSS attacks

#### Engagement Features

- **FR-029**: System MUST allow readers to like published posts
- **FR-030**: System MUST prevent duplicate likes from the same user (toggle behavior: like/unlike)
- **FR-031**: System MUST display accurate like counts on each post
- **FR-032**: System MUST persist like state per user to show which posts they've liked

#### Responsive Layout

- **FR-033**: System MUST implement 3-column layout on desktop (≥1024px): left (navbar, info), center (posts), right (filters)
- **FR-034**: System MUST implement 2-column layout on tablet (768px-1023px): main content + collapsible sidebar
- **FR-035**: System MUST implement single-column layout on mobile (<768px) with hamburger menu
- **FR-036**: System MUST ensure all touch targets are minimum 44×44 pixels for mobile accessibility
- **FR-037**: System MUST load homepage in under 3 seconds on 3G mobile connection

#### Security & Rate Limiting

- **FR-038**: System MUST implement rate limiting: maximum 10 posts per hour per authenticated user
- **FR-039**: System MUST implement rate limiting: maximum 30 comments per hour per IP address
- **FR-040**: System MUST implement CSRF protection for all state-changing operations (post creation, comments, likes)
- **FR-041**: System MUST sanitize all user input (posts, comments, tags) to prevent injection attacks

#### Performance

- **FR-042**: System MUST render Markdown to HTML in under 50ms for typical posts (≤500 words)
- **FR-043**: System MUST achieve Lighthouse performance score >80 on mobile
- **FR-044**: System MUST respond to content retrieval API requests in under 200ms (p95)

### Key Entities

- **Post**: Represents a blog entry with Markdown content, status (draft/published), publication date, author reference, and associated tags. Published posts are immutable.

- **Tag**: Represents a topic category with normalized name (lowercase, hyphenated). One tag can be associated with many posts; one post can have 1-5 tags.

- **Comment**: Represents reader feedback on a post with content, moderation status (pending/approved/rejected/flagged), submission timestamp, post reference, and commenter information.

- **Like**: Represents a reader's positive reaction to a post. One reader can like many posts, but only once per post. Tracks which user liked which post.

- **Author**: Represents a content creator who can create drafts and publish posts. Authors can own multiple posts and receive notifications about approved comments.

- **Reader**: Represents a visitor who can browse posts, filter by tags/dates, submit comments, and like posts. May or may not be authenticated.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Authors can create, draft, and publish a post with Markdown formatting in under 5 minutes from start to finish
- **SC-002**: 95% of Markdown posts render correctly on first try without syntax errors
- **SC-003**: Tag filtering updates the post list in under 500ms on desktop and 1 second on mobile
- **SC-004**: Homepage loads with 10 posts in under 3 seconds on 3G mobile connection (Lighthouse score >80)
- **SC-005**: Mobile users can read and interact with posts without horizontal scrolling or zoom
- **SC-006**: Comment moderation queue displays pending comments within 2 seconds of submission
- **SC-007**: 90% of reader interactions (likes, comment submissions) complete successfully on first attempt
- **SC-008**: System handles 100 concurrent readers browsing posts without performance degradation
- **SC-009**: Tag pages with 50+ posts load and render in under 2 seconds
- **SC-010**: Post content with 500 words of Markdown renders to HTML in under 50ms

## Assumptions

- Authors have basic knowledge of Markdown syntax (headers, links, lists, code blocks)
- Blog is for single-author or small team use (not multi-tenant SaaS platform)
- Email notification system is available for comment approval notifications
- Authentication/authorization system exists or will be implemented separately
- Database can handle relational queries for tag filtering and timeline sorting efficiently
- Moderators actively review pending comments within 24-48 hours
- Readers tolerate pending comment approval delays (standard blog behavior)
- Mobile users primarily use portrait orientation on phones
- Browser support targets modern evergreen browsers (Chrome, Firefox, Safari, Edge)
- Deployment environment can achieve <200ms API response times with proper infrastructure

## Out of Scope

- Rich text WYSIWYG editor (Markdown-only approach per constitution)
- Real-time collaborative editing of posts
- Post versioning history or revision tracking
- Author profiles with bio, avatar, social links (only basic author reference)
- Comment reply threading (flat comment list only)
- Comment voting or upvoting system
- Full-text search across posts (may be added in future iteration)
- Social media sharing buttons
- RSS/Atom feed generation
- Dark mode theme toggle
- Multi-language internationalization (i18n)
- SEO meta tag management interface
- Analytics dashboard or pageview tracking
- Email subscription system for new posts
- Draft scheduling or delayed publishing
- Post categories (tags serve this purpose)
- Media upload and management (images/videos in posts)
- Spam detection algorithms (manual moderation only)
- User roles beyond author/moderator/reader

## Dependencies

- PostgreSQL 15+ database for storing posts, tags, comments, and likes
- Markdown rendering library: markdown-it (JavaScript) or python-markdown (Python)
- HTML sanitization library: DOMPurify (JavaScript) or bleach (Python)
- Email service for comment approval notifications (SendGrid, AWS SES, or SMTP)
- Authentication system (session-based or JWT) for author/moderator access
- CSS framework or grid system for responsive layout implementation
- Rate limiting middleware or library for API endpoint protection

## Notes

- This specification adheres to the Microblog CMS Constitution v1.0.0
- Markdown is the source of truth; HTML rendering is ephemeral (Principle III)
- Mobile-first design is enforced throughout UI requirements (Principle II)
- Comment moderation security is prioritized with pending-by-default policy (Principle V)
- Timeline-based navigation is primary; tag filtering is secondary (Principle VI)
- All user stories are independently testable and can be delivered incrementally
- Published post immutability aligns with content integrity and audit trail needs
- Tag normalization ensures consistent navigation and prevents duplicate tags with different casing
- Rate limiting prevents abuse while allowing legitimate usage patterns
- Performance budgets align with constitution standards for mobile-first experience
