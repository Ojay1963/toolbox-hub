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
