# North

North is a personal life-operating-system: one app for check-ins, notes,
collections, career, learning, work, finances, hobbies, creative projects,
and the life you're building toward — with real relationships between them
instead of disconnected mini-apps.

## Stack

- Next.js 16 (App Router, Turbopack) + TypeScript + React 19
- Tailwind CSS v4 with a warm/editorial design system (see `/design-system`)
- Supabase: Postgres (RLS on every table), Auth, Storage
- Zod + React Hook Form for validated forms
- Vitest for tests

## Getting started

```bash
npm install
npm run dev
```

Environment variables live in `.env.local` (Supabase URL + publishable key —
already present for the `north` Supabase project). The database schema,
storage buckets, and RLS policies are managed directly in Supabase via SQL
migrations (see the Supabase project's migration history), not through a
local ORM migration tool.

## Project structure

```text
src/
├── app/
│   ├── (auth)/          sign-in, sign-up, password reset
│   ├── (app)/            authenticated shell: dashboard, check-ins, notes,
│   │                     collections, career, learning, work, finances,
│   │                     hobbies, creative-studio, dream-life, settings,
│   │                     design-system
├── components/
│   ├── ui/               shared primitives (Button, Card, Dialog, ...)
│   ├── navigation/        sidebar, mobile nav, global search, quick create
│   └── <module>/          domain components per life module
├── lib/                  supabase clients, zod schemas, constants, utils
├── server/actions/        "use server" actions (validate → service → db)
├── services/              data-access functions per domain
└── types/                 generated Supabase types
```

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run lint` — ESLint
- `npm run test` — Vitest
