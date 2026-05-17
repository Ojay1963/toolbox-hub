# Toolbox Hub

SEO-focused online tools website built with Next.js, TypeScript, Tailwind CSS, and the App Router.

The project is designed around a central tool registry, reusable page templates, browser-first processing where practical, and honest limited-scope pages where full local capability is not realistic.

## Stack

- Next.js
- TypeScript
- Tailwind CSS
- App Router
- ESLint
- npm

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Set the site URL

Create a `.env.local` file:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

Use your real production domain for correct canonicals, sitemap URLs, and structured data.

### 3. Start the dev server

```bash
npm run dev
```

Open `http://localhost:3000`.

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
```

## Build

Run a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run start
```

## Project Structure

```text
app/
  page.tsx                 Homepage
  layout.tsx               Global layout + sitewide metadata
  robots.ts                robots.txt
  sitemap.ts               sitemap.xml
  category/[slug]/page.tsx Category template
  tools/[slug]/page.tsx    Tool template

components/
  layout/                  Header and footer
  ui/                      Shared cards, FAQ, ad slots, sections, search
  tools/                   Tool implementations by category
  tool-page.tsx            Shared tool detail page layout

lib/
  tools.ts                 Central tool registry and category data
  seo.ts                   Metadata helpers and JSON-LD helpers
```

## How the Registry Works

The project is driven by [lib/tools.ts](./lib/tools.ts).

Each tool entry defines:

- `name`
- `slug`
- `category`
- `shortDescription`
- `longDescription`
- `keywords`
- `howToUse`
- `faq`
- `relatedToolSlugs`
- `implementationStatus`
- `seoTitle`
- `seoDescription`
- optional `statusNote`

That single entry powers:

- the tool route at `/tools/[slug]`
- metadata generation
- sitemap inclusion
- category page listings
- homepage listings
- search
- related tool linking
- status labeling

## How to Add a New Tool

### 1. Add the registry entry

Add a new tool object in [lib/tools.ts](./lib/tools.ts) with the correct category, slug, descriptions, FAQ, and SEO fields.

Use a human-readable slug like:

```text
json-formatter
pdf-page-rotator
image-to-base64-converter
```

### 2. Decide the implementation status

Use one of:

- `working-local`
- `planned-local`
- `reduced-scope-local`
- `coming-soon`

Be honest. Do not mark a tool as working if it is only a placeholder.

### 3. Build the tool UI

Add the implementation in the appropriate file under [components/tools/](./components/tools):

- `image-tools.tsx`
- `pdf-tools.tsx`
- `text-tools.tsx`
- `developer-tools.tsx`
- `generator-tools.tsx`
- `calculator-tools.tsx`
- `converter-tools.tsx`
- `internet-tools.tsx`

### 4. Wire it into the renderer

Map the new tool slug in [components/tools/tool-renderer.tsx](./components/tools/tool-renderer.tsx).

Once mapped, the existing tool page template will render it automatically.

## How Metadata Works

Shared SEO helpers live in [lib/seo.ts](./lib/seo.ts).

They currently handle:

- page metadata
- canonical URLs
- Open Graph fields
- Twitter metadata
- breadcrumb JSON-LD
- FAQ JSON-LD
- HowTo JSON-LD
- CollectionPage JSON-LD
- SoftwareApplication JSON-LD
- WebSite JSON-LD

Metadata is applied in:

- [app/layout.tsx](./app/layout.tsx) for global defaults
- [app/page.tsx](./app/page.tsx) for homepage SEO
- [app/category/[slug]/page.tsx](./app/category/%5Bslug%5D/page.tsx) for category pages
- [app/tools/[slug]/page.tsx](./app/tools/%5Bslug%5D/page.tsx) for tool pages

## How to Extend Limited-Scope Tools Later

Some tools are intentionally labeled `reduced-scope-local` or `coming-soon`.

Examples:

- static/manual currency conversion
- browser-only IP inspection
- future-ready DNS lookup
- future-ready PDF/Word conversion
- background remover placeholder

To upgrade one later:

1. Keep the existing registry entry and slug.
2. Update the tool UI implementation in `components/tools/`.
3. Change `implementationStatus` in [lib/tools.ts](./lib/tools.ts) when the tool is genuinely ready.
4. Update `statusNote`, FAQ answers, and descriptions so the page stays honest.

This avoids route changes and preserves SEO continuity.

## Ad Slot Notes

Ad placeholders are reusable and live in [components/ui/ad-placeholder.tsx](./components/ui/ad-placeholder.tsx).

They are slot-based so real monetization components can replace them later without reworking layouts.

## Deployment Notes for Vercel

### Recommended setup

- Push the repo to GitHub
- Import the project into Vercel
- Framework preset: `Next.js`
- Build command: `npm run build`

### Required environment variable

Set:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### Service-backed tool environment checks

These tools should only be launched publicly when their backing service is configured:

- `background-remover` and `remove-background-from-image`: `REMOVE_BG_API_KEY`
- `pdf-ocr-placeholder`: `OCR_SPACE_API_KEY`
- `protect-pdf`: `PDF_PROTECT_SERVICE_URL`
- `website-screenshot-tool`: `SCREENSHOT_SERVICE_URL`

Launch behavior is now deployment-aware:

- if a required env var is missing, the tool page shows an explicit unavailable panel instead of an active but broken form
- unavailable service-backed tools are not indexed
- unavailable service-backed tools are not surfaced in featured discovery lists
- alias routes remain non-indexed

### Durable API rate limiting

Expensive `app/api/tools/*` routes now use a durable Redis REST-backed fixed-window limiter that is suitable for Vercel or other serverless deployments.

Supported environment variables:

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

The limiter also accepts Vercel KV-style aliases if your deployment exposes them:

- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`

Protected routes include the highest-cost workflows such as OCR, background removal, screenshots, speed tests, mobile-friendly checks, PDF protection, and document conversion endpoints.

In local development, rate limiting is allowed to bypass when the Redis REST env vars are not configured.
In production, missing rate-limit env vars will make those API routes return a clear service-unavailable error instead of silently falling back to per-instance memory.

### Before going live

- confirm the real domain is set in `NEXT_PUBLIC_SITE_URL`
- run `npm run lint`
- run `npm run build`
- verify homepage, category pages, and tool pages
- verify `robots.txt` and `sitemap.xml`

## Solo Developer Workflow

For safe iteration:

1. Update the registry first.
2. Build the tool logic second.
3. Wire the slug into `tool-renderer.tsx`.
4. Run lint and build before considering the change done.

This keeps the project simple, scalable, and easy to reason about.

---

## SEO Architecture

This section documents the SEO strategy, schema types, sitemap structure, and meta tag approach used across the site.

### Meta Tag Strategy

Every page generates unique, non-duplicate metadata via Next.js `generateMetadata()` or exported `metadata` constants.

**Tool page title format:**

```
[Action Phrase] — No Signup | Toolbox Hub
```

Examples:
- `Compress JPG, PNG, and WebP Online — No Signup | Toolbox Hub`
- `Combine PDF Files Online — No Signup | Toolbox Hub`
- `Format and Validate JSON Online — No Signup | Toolbox Hub`

The title is derived automatically from each tool's `seoTitle` field. If `seoTitle` contains a ` - ` separator, the action phrase after it is extracted and used as the title basis. Otherwise the full `seoTitle` is used.

**Description:** 140–155 characters, action-oriented, ends with "No signup. Works in your browser." (from each tool's `seoDescription` field in the registry).

**Canonical tags:** Every page includes a canonical URL pointing to its own route via `alternates.canonical` in `buildMetadata()`. Alias tool slugs redirect 301 to their canonical equivalent.

**Open Graph tags:** `og:title`, `og:description`, `og:url`, `og:image` — generated by `buildMetadata()` from `lib/seo.ts`. All tool pages get a dynamically generated 1200×630 OG image from `app/tools/[slug]/opengraph-image.tsx`.

**Twitter cards:** `twitter:card`, `twitter:title`, `twitter:description` — included on every page via `buildMetadata()`.

**Robots:** Index/follow by default. Service-backed tools that are unavailable, alias routes, and preview deployments are automatically noindexed.

### H1 Strategy

Tool pages use an action-oriented H1 derived from `seoTitle`:

```
❌ "Image Compressor"
✅ "Compress JPG, PNG, and WebP Online Free"
```

The `buildActionH1()` helper in `components/tool-page.tsx` extracts the action phrase from `seoTitle` and appends "Free" if not already present.

### Structured Data (JSON-LD) Schema Types

All schema is injected as `<script type="application/ld+json">` tags — never microdata.

| Schema Type | Where Applied | Builder |
|---|---|---|
| `WebSite` + `SearchAction` | Global layout (`app/layout.tsx`) | `buildWebsiteJsonLd()` |
| `Organization` | Global layout (`app/layout.tsx`) | `buildOrganizationJsonLd()` |
| `SoftwareApplication` | Every tool page | `buildSoftwareApplicationJsonLd()` |
| `FAQPage` | Every indexed tool page | `buildFaqJsonLd()` |
| `HowTo` | Every indexed tool page | `buildHowToJsonLd()` |
| `BreadcrumbList` | Every tool page and homepage | `buildBreadcrumbJsonLd()` |
| `CollectionPage` | Homepage | `buildCollectionPageJsonLd()` |

**SoftwareApplication schema fields per tool page:**

```json
{
  "@type": "SoftwareApplication",
  "applicationCategory": "WebApplication",
  "operatingSystem": "Any",
  "offers": { "price": "0", "priceCurrency": "USD" }
}
```

**WebSite SearchAction** enables the Google Sitelinks Search Box:

```json
{
  "@type": "SearchAction",
  "target": "https://toolboxhubapp.com/?q={search_term_string}#search-tools"
}
```

### Sitemap Structure

Generated dynamically at `/sitemap.xml` from `app/sitemap.ts`. Refreshed every 24 hours (`revalidate: 86400`).

| Page Type | Priority | Change Frequency |
|---|---|---|
| Homepage | 1.0 | weekly |
| Tool pages (working) | 0.9 | monthly |
| Category pages (high-value) | 0.9 | weekly |
| Education tool pages (popular) | 0.88 | weekly |
| Blog articles | 0.86 | monthly |
| Tools directory | 0.86 | monthly |
| Tool pages (reduced-scope) | 0.78 | monthly |
| Category pages (standard) | 0.68 | weekly |
| Static pages (about, contact) | 0.54–0.62 | monthly |

Alias routes and noindexed tools are excluded from the sitemap via `shouldIncludeToolInSitemap()`.

### Robots.txt

Served from `app/robots.ts`. In production:

```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /*?*
Sitemap: https://www.toolboxhubapp.com/sitemap.xml
```

Preview deployments return `Disallow: /` to block all crawlers.

### Breadcrumb Navigation

Every tool page includes both:
1. A visual breadcrumb component (`components/seo/breadcrumbs.tsx`): `Home > [Category] > [Tool Name]`
2. `BreadcrumbList` JSON-LD matching the visual trail

### OG Images

Every tool page generates a unique 1200×630 Open Graph image at build time via `app/tools/[slug]/opengraph-image.tsx` using `next/og` `ImageResponse`.

Design: navy background (`#0F172A`), colour-coded category badge, tool name in white bold text, short description in slate, feature pills (Free to Use / No Signup / Works in Browser), Toolbox Hub branding bottom-right.

### Internal Linking

Every tool page links to:
- 3–4 `relatedToolSlugs` defined per tool in the registry
- Category page for the tool's category
- 4 most-popular tools in the same category
- 4 most-recent tools in the same category
- A "People also search for" phrase cluster

### Adding SEO Fields to a New Tool

When adding a new tool to the registry, fill these fields carefully:

```typescript
seoTitle: "Action Phrase - Keyword-rich Secondary Phrase Online",
seoDescription: "Action-oriented 140–155 char description. No signup. Works in your browser.",
keywords: ["primary keyword", "secondary keyword", "..."],
faq: [/* 2 or more question-answer pairs targeting long-tail queries */],
howToUse: ["Step 1 with clear action.", "Step 2.", "Step 3."],
relatedToolSlugs: ["slug-a", "slug-b", "slug-c"],
peopleAlsoSearchFor: [{ phrase: "related search", href: "/tools/related-slug" }],
```
