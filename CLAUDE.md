# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # start dev server
npm run build    # production build
npm run lint     # ESLint
```

There are no tests. No test runner is configured.

## Stack

- **Next.js 16** (App Router) — read `node_modules/next/dist/docs/` before writing Next.js code; APIs may differ from training data
- **React 19**
- **Supabase** (`@supabase/ssr`) — auth + Postgres + Storage
- **next-intl 4** — i18n, locales: `en` / `tr`, config in `src/i18n/`
- **shadcn/ui built on `@base-ui/react`** (NOT Radix) — `asChild` does not exist; use `render={<Link href="..." />}` or `buttonVariants()` class on a plain `<Link>`
- **Tailwind CSS v4** — theme tokens in `src/app/globals.css` (oklch color space, amber hue ~72–75)
- **Framer Motion** — wrappers in `src/components/ui/motion-wrappers.tsx`

## Architecture

### Routing

All user-facing pages live under `src/app/[locale]/`. The middleware (`src/middleware.ts`) handles locale detection via next-intl. Every page receives `params: Promise<{ locale: string }>`.

### Supabase clients

Two separate clients — never mix them:

| File | Use in |
|------|--------|
| `src/lib/supabase/server.ts` | Server Components, Route Handlers (`cookies()`) |
| `src/lib/supabase/client.ts` | Client Components (`'use client'`) |

The `Database` generic type is intentionally not used on the client (type casting instead) due to a compatibility issue with the Supabase generic.

### Data fetching pattern

Pages are server components that fetch from Supabase directly, then pass plain props to client components. There is no API layer — queries run in page files (e.g. `src/app/[locale]/page.tsx`, `src/app/[locale]/profile/[username]/page.tsx`).

### i18n

- Message files: `messages/tr.json` and `messages/en.json` at the **project root** (not inside `src/`)
- Server: `getTranslations('namespace')` from `next-intl/server`
- Client: `useTranslations('namespace')` from `next-intl`
- Adding a translation key requires updating both JSON files

### Database schema (key tables)

- `profiles` — auto-created on signup via trigger; `id` = auth user UUID
- `prompts` — `user_id`, `category_id`, `parent_id` (fork), `star_count`, `fork_count`, `created_at`
- `prompt_stars` — junction table; star/unstar triggers update `star_count`
- `prompt_outputs` — `type: 'text' | 'image'`, image URLs point to the `outputs` Storage bucket
- `categories` — seeded; slugs include `yazilim`, `tasarim`, `diger`, etc.

Contribution score formula: `promptCount * 10 + totalStars * 5`

### UI component rules

- **No `asChild` prop** — use `render={<element />}` or apply `buttonVariants()` as a className on `<Link>`
- Color tokens use oklch; primary accent is amber (~hue 72–75 in light, same hue darker in dark)
- `src/components/ui/` — shadcn primitives (Button, Card, Avatar, etc.)
- `src/components/layout/` — Navbar (server) + NavbarClient (client), Footer, LocaleSwitcher, ThemeToggle
- `src/components/prompts/` — PromptCard, PromptForm, StarButton, ForkStarButton, etc.
- `src/components/profile/` — ContributionScore, ContributionHeatmap

### Environment variables required

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### Supabase setup (first time)

1. Create project at supabase.com
2. Fill `.env.local`
3. Run `supabase/migrations/001_initial.sql` in the SQL Editor
4. Create a public Storage bucket named `outputs`
