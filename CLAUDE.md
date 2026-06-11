# CLAUDE.md — romans1211 (Christian Material Library)

## Project Overview

A multi-tenant Christian ministry resource platform (romans1211.com) for managing and sharing Songs, Texts (sermons/Bible studies), and Games across organizations, courses, and events. Built with Next.js 15 App Router, React 19, TypeScript, Prisma 6 (PostgreSQL), NextAuth v4, next-intl (en/ru), Tailwind CSS, and a mix of Zod (API) + Joi/Yup (forms) for validation.

---

## Commands

```bash
# Development
npm run dev           # Next.js dev server with Turbopack
npm run build         # prisma generate + next build
npm run start         # Production server
npm run lint          # ESLint (next lint)
npx tsc --noEmit      # Type-check without emitting (no test framework — this is the gate)

# Database
npm run postgres                              # Start local Postgres via Docker Compose (dev only)
npm run migrate -- <name>                     # Create and apply a migration (prisma migrate dev --name)
npm run migrate:create -- <name>              # Create migration SQL only, don't apply
npm run migrate:deploy                        # Apply pending migrations (production)
npm run migrate:reset                         # Wipe DB and re-run all migrations (dev only)
npm run migrate:status                        # Show migration status
npm run generate                              # Regenerate Prisma client after schema changes

# i18n
npm run messages      # Pull latest translations from i18nexus
```

---

## Architecture

### Route Layout

```
src/app/
  [locale]/
    layout.tsx                    # Root layout: NextIntlClientProvider, NextAuth session, progress bar
    (auth)/
      (public)/                   # Public pages (home, library-catalog, events/:slug, about, contact, terms)
        layout.tsx                # Public layout with nav
      login/ register/ forgot-password/ reset-password/ verify-email/
    dashboard/
      layout.tsx                  # Auth guard (redirects if no session) + OrganizationProvider + Sidebar
      library/                    # Private material library: list, view, create, edit, translate
      events/[id]/                # Event plan builder (drag-and-drop items, materials column)
      courses/[id]/               # Course management with default plan items
      organizations/[id]/         # Org settings and member management
      settings/                   # User account settings
  api/
    auth/[...nextauth]/           # NextAuth handler
    auth/register|forgot-password|reset-password|verify-email/
    materials/[id]/               # CRUD + change-type, make-original, change-group-visibility
    tags/ tags/search/
    events/[id]/ event-plan-items/ event-members/
    courses/[id]/ courses/[id]/default-event-plan-items/
    organizations/[id]/ organization-members/[id]/
    public/events/[slug]/         # Unauthenticated event access by link
    admin/                        # Admin endpoints (protected by x-admin-password header)
    send/                         # Resend email (templates: verification, reset-password)
    user/settings/
```

### Middleware (`src/middleware.ts`)

Handles three concerns in order:
1. `/api/admin/*` — requires `x-admin-password` header matching `ADMIN_PASSWORD` env var
2. `/api/auth/*` and `/api/public/*` — pass through unauthenticated
3. All other `/api/*` — JWT token check via `next-auth/jwt`; 401 if missing
4. Auth pages (login/register/etc.) — redirect to `/` if already logged in
5. All page routes — run `next-intl` middleware for locale routing

Locales: `en` (default, no prefix in URL), `ru` (prefixed `/ru/...`). Configured in `src/i18n/routing.tsx`.

### Service Layer (`src/lib/`)

| File | Purpose |
|------|---------|
| `auth.ts` | `authOptions` (Google + Credentials), `getSession()` helper |
| `prisma.ts` | Singleton Prisma client |
| `permissions.ts` | `ORG_*_PERMISSIONS` arrays; `OrganizationPermission` enum from schema |
| `MaterialServiceForAPI.ts` | Material CRUD with permission checks, used in API routes |
| `MaterialServiceForSSR.ts` | Material queries for server components |
| `OrganizationServiceForSSR.ts` | Org queries for server components and layouts |
| `EventServiceForSSR.ts` | Event queries for SSR |
| `TagServiceForAPI.ts` | Tag search/management |
| `email.ts` | Resend email sending wrapper |

### Client-Side API Layer

- `src/api/client.ts` — Axios instance (`baseURL: NEXT_PUBLIC_BACKEND_URL`)
- `src/api/requests/materials.ts`, `tags.ts` — typed request functions that call the Axios client
- `src/api/useApiCall.ts` — hook wrapping async calls with loading/error state

### Component Taxonomy (`src/components/`)

| Folder | Contents |
|--------|---------|
| `forms/` | Multi-field form components (e.g., `LibraryCatalogFilter`) |
| `dialogs/` | Modal dialogs |
| `inputs/` | Reusable inputs, rich text editor (Tiptap-based `TextEditor`) |
| `ui/` | Primitive UI elements (shadcn-style, Radix-based) |
| `widgets/` | Composite feature widgets; `widgets/ui/` has the `Sidebar` |
| `buttons/`, `badges/`, `banners/`, `tabs/`, `typo/`, `popups/` | Single-purpose component families |
| `contexts/` | React context providers: `OrganizationContext`, `ClientSessionProvider`, `ProgressProvider` |
| `client/` | Client-only wrapper components |
| `CardGrid/` | Shared card grid display |

Route-specific components live in `components/` subdirectories co-located with their page (e.g., `src/app/[locale]/dashboard/events/[id]/components/`).

### Prisma Schema (`prisma/schema.prisma`)

Core models: `User`, `Organization`, `OrganizationMember`, `Course`, `Event`, `EventPlanItem`, `PreparationItem`, `Text`, `Song`, `Game`, `GamePreparation`, `Wtag` (tags), `CourseMember`, `EventMember`, `DefaultEventPlanItem`, `DefaultPreparationItem`.

Key relationships:
- `User` owns `Organization`s; joins via `OrganizationMember` with `OrganizationPermission[]`
- `Organization` contains `Text[]`, `Song[]`, `Game[]` (the library materials)
- `Course` groups `Event`s with `DefaultEventPlanItem`s as a template
- `EventPlanItem` references a `Song`, `Text`, or `Game` (nullable FKs, type = `EventPlanItemType` enum: `SONG | TEXT | GAME | COMMENT | CUSTOM`)
- Materials have `isPublic` + `originalId` self-referencing for translation tracking
- Events can be accessed by public link via `linkSlug` + `isAvailableByLink`

---

## Key Conventions

### i18n — All User-Facing Strings

- Never hardcode strings in components. Use `useTranslations()` (client) or `getTranslations()` (server).
- Messages live in `messages/en.json` and `messages/ru.json` — always update **both** files.
- Pull from i18nexus with `npm run messages` (requires `I18NEXUS_API_KEY`).
- Navigation/routing: import `Link`, `redirect`, `useRouter` from `src/i18n/routing.tsx`, not from `next/navigation`.

### Database Changes

- Always create a migration: `npm run migrate -- <descriptive-name>`
- **Never** use `prisma db push` in production — it bypasses migration history.
- After schema changes, run `npm run generate` to regenerate the client.

### Validation

- **API routes**: Zod for parsing/validating request bodies at the boundary.
- **Forms**: Joi or Yup with `react-hook-form` + `@hookform/resolvers`.
- **Type guards**: `TMaterialType` validation done in `MaterialServiceForAPI` before DB queries.

### Auth in API Routes

- Every non-public API route must call `getServerSession(authOptions)` and return 401 if `!session?.user`.
- Middleware handles JWT-level auth, but route handlers re-verify session for user ID and permission checks.
- Admin routes (`/api/admin/*`) use `x-admin-password` header instead of session auth.
- Permission model: check `OrganizationMember.permissions` array against `ORG_*_PERMISSIONS` constants from `src/lib/permissions.ts`.

### No Test Framework

There are no unit or integration tests. Verification gates are:
1. `npm run lint` — ESLint
2. `npx tsc --noEmit` — TypeScript type checking

Run both before submitting changes.

### SVG Imports

SVGs are handled via `@svgr/webpack` — import as React components: `import Icon from '@/assets/icon.svg'`.

---

## Environment Variables (`.env.example`)

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | JWT signing secret (required for NextAuth) |
| `NEXTAUTH_URL` | Canonical URL of the app (e.g., `http://localhost:3000`) |
| `RESEND_API_KEY` | Resend.com API key for transactional email |
| `RESEND_EMAIL` | Sender address for transactional emails |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `POSTGRES_DB / POSTGRES_USER / POSTGRES_PASSWORD` | Docker Compose local Postgres credentials (dev only) |
| `I18NEXUS_API_KEY` | i18nexus translation management API key (optional for dev) |
| `ADMIN_PASSWORD` | Plain-text password checked in middleware for `/api/admin/*` routes |
