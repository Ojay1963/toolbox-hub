# AGENTS.md

## Project
Build a production-ready SEO-focused online tools website with 50 working tools.

## Stack
- Next.js latest
- TypeScript
- Tailwind CSS
- App Router
- ESLint
- npm
- Static metadata where possible
- Local/browser-side processing for tools whenever possible
- Server routes only when truly needed

## Goals
- Fast
- Clean
- Mobile-friendly
- SEO-friendly
- Easy to scale beyond 50 tools
- Ready for ad monetization
- Good internal linking
- Good accessibility

## Non-goals
- No authentication
- No dashboard
- No paid APIs
- No AI generation features
- No unnecessary database unless required
- No overengineering

## Architecture rules
- Use a central tool registry
- Use reusable page templates
- Use reusable category templates
- Keep components small and readable
- Prefer simple utility functions over complex abstractions
- Prefer local processing in the browser for tool logic
- Do not create fake tools or placeholder-only UIs

## Content rules
Each tool page must include:
- Tool UI
- Tool description
- How to use
- FAQ
- Related tools
- SEO title and description
- Internal links

## SEO rules
- Generate metadata for homepage, categories, and tool pages
- Include sitemap
- Include robots.txt
- Use canonical URLs where appropriate
- Use structured data only when useful
- Avoid thin content

## UX rules
- Responsive on mobile first
- Accessible semantic HTML
- Clear empty states and error states
- No intrusive popups
- Ad placeholders allowed but must not damage UX

## Quality rules
Before considering a task done:
- Run lint
- Run build
- Fix type errors
- Verify routes
- Verify all added tools work
- Keep files organized
- Explain files changed and decisions made

## Output style
For every non-trivial task:
1. Briefly plan first
2. Then implement
3. Then list files changed
4. Then list any follow-up risks or tradeoffs