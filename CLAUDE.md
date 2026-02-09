# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project Overview

Gaanavykhari Admin is a management app for a solo-run music school. A single teacher uses it to track students, sessions, payments, and holidays. Payments support cash, UPI, and Razorpay payment links.

## Development Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build (uses Turbopack)
npm run start        # Start production server
npm run lint         # ESLint check
npm run lint:fix     # ESLint auto-fix
npm run format       # Prettier format all files
npm run format:check # Check formatting
npm run type-check   # TypeScript type checking (tsc --noEmit)
```

## Git Hooks (Husky)

- **Pre-commit**: Prettier auto-formats staged files (via lint-staged)
- **Pre-push**: Runs `tsc --noEmit` type checking

## Tech Stack

- **Next.js 16** with App Router, **React 19**, **TypeScript** (strict mode, `noUncheckedIndexedAccess: true`)
- **Supabase** (PostgreSQL + Auth + RLS) — clients in `lib/supabase/`
- **Mantine v8** for UI components, forms, dates, notifications
- **date-fns** for date manipulation
- **Razorpay** for payment links (lazy-initialized, optional)

## Architecture

### Data Flow

Client components (`'use client'`) -> `fetch()` to API routes -> Supabase operations -> JSON response

### Key Directories

- `app/api/` — Route handlers: `students/`, `sessions/`, `payments/`, `holidays/`, `dashboard/`, `schedule/`, `razorpay/`, `health/`
- `components/` — React components organized by feature: `layout/`, `students/`, `sessions/`, `payments/`, `holidays/`, `common/`
- `lib/` — Server utilities: `supabase/` (client, server, admin), `razorpay.ts`, `schedule.ts`, `format.ts`, `constants.ts`
- `hooks/` — Client hooks: `useAuth.ts`
- `types/` — TypeScript types: `database.ts`, `api.ts`, `index.ts`

### Authentication

- Supabase Auth with email/password login
- `proxy.ts` checks `getUser()`, redirects unauthenticated users to `/login`
- Public routes: `/login`, `/_next`, `/api/razorpay/webhook`, `/api/health`, `/favicon`, `/manifest.json`
- Users are created manually via Supabase dashboard

### Schedule System

`lib/schedule.ts` handles weekly session scheduling. Each student has a `schedule` field (JSONB) mapping day numbers (0=Sun..6=Sat) to time strings (HH:MM), allowing different times per day. Holidays automatically skip overlapping sessions.

### API Response Pattern

All API responses use `ApiResponse<T>` with `{ ok, message, data?, error? }` shape.

### Theme

Supports light, dark, and system (auto) color schemes via Mantine's `defaultColorScheme="auto"`.

## Environment Variables

Required in `.env.local` (see `.env.example`):

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase config
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase admin operations
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` — Razorpay (optional)
- `NEXT_PUBLIC_APP_URL` — App URL

## Code Style

- Prettier: single quotes, trailing commas (es5), 80 char width, arrow parens avoid
- ESLint: `no-unused-vars` (warn), `no-console` (warn), `curly` (error)
- Path alias: `@/*` maps to project root

## Supabase Schema

Tables: `students`, `sessions`, `holidays`, `payments`
RLS: All tables allow all operations for authenticated users (single-teacher app).

### Student Schedule Model

The `students.schedule` column is JSONB storing a `WeeklySchedule` (TypeScript: `Record<string, string>`). Keys are day numbers ("0"=Sunday through "6"=Saturday), values are time strings ("HH:MM"). Example: `{"1": "16:30", "3": "16:30", "5": "17:00"}` means Mon/Wed at 4:30 PM and Fri at 5:00 PM.
