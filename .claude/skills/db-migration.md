# Database Migration Workflow

Schema: `prisma/schema.prisma` | ORM: Prisma 6 | DB: PostgreSQL

---

## Standard workflow

### 1. Edit the schema

Open `prisma/schema.prisma` and make your changes.

Conventions in this project:
- IDs: `String @id @default(cuid())`
- Every model has `createdAt DateTime @default(now())` and `updatedAt DateTime @updatedAt`
- Long text: `@db.Text` | Short strings: `@db.VarChar(N)`
- Add `@@index([fieldName])` for any field used in `where`, `orderBy`, or foreign key lookups
- Optional fields use `?`; boolean and numeric fields always have `@default(...)`

### 2. Create the migration file (do NOT apply yet)

```bash
yarn migrate:create <descriptive-name>
# Runs: npx prisma migrate dev --create-only --name <descriptive-name>
# Writes: prisma/migrations/<timestamp>_<name>/migration.sql
```

The `--create-only` flag writes the SQL to disk without executing it.

### 3. Review the generated SQL

Open `prisma/migrations/<timestamp>_<name>/migration.sql` and check for:

| Red flag | Action |
|---|---|
| `DROP COLUMN` | Confirm the column is truly unused. Prefer a two-phase migration: keep column → backfill → drop in a separate PR. |
| `ALTER COLUMN … SET NOT NULL` without a prior default | Add a `DEFAULT` or an `UPDATE` backfill before the constraint (see backfill section below). |
| `DROP TABLE` | Should be intentional only if you explicitly removed a model from the schema. |
| `ALTER TYPE` on an enum | PostgreSQL requires an explicit CAST. Split into two migrations or add the cast manually. |
| Index on a large table | Consider replacing `CREATE INDEX` with `CREATE INDEX CONCURRENTLY` to avoid table lock. |

### 4. Apply in development

```bash
yarn migrate
# Runs: npx prisma migrate dev --name <name>
# Applies the pending migration and regenerates the Prisma client.
```

If the IDE still shows type errors after regeneration:

```bash
npx prisma generate
```

### 5. Apply in production

```bash
yarn migrate:deploy
# Runs: npx prisma migrate deploy
# Applies all pending migrations from prisma/migrations/ without prompting.
# Does NOT regenerate the client — that happens at build time via:
# "build": "prisma generate && next build"
```

---

## When a data backfill is needed

Use this pattern whenever adding a NOT NULL column to a table that already has rows,
or when renaming / splitting data.

1. `yarn migrate:create <name>` to generate the SQL file.
2. Edit the generated SQL to follow the three-step pattern:

```sql
-- Step 1: add the column as nullable
ALTER TABLE "Song" ADD COLUMN "difficulty" INTEGER;

-- Step 2: backfill existing rows
UPDATE "Song" SET "difficulty" = 1 WHERE "difficulty" IS NULL;

-- Step 3: add the NOT NULL constraint
ALTER TABLE "Song" ALTER COLUMN "difficulty" SET NOT NULL;
```

3. `yarn migrate` to apply.

For relation backfills or complex transforms, write the `UPDATE` as a sub-select or
use a CTE — Prisma executes raw SQL exactly as written.

---

## Other commands

| Command | Purpose |
|---|---|
| `yarn migrate:status` | Show which migrations are applied vs. pending |
| `yarn migrate:reset` | **Destructive.** Drops the DB and re-applies all migrations. Dev only. |
| `yarn postgres` | Start the local PostgreSQL container (`docker compose -f docker-compose.dev.yml up -d`) |
| `npx prisma studio` | Browser-based DB viewer (dev only) |

---

## Hard rules

- **NEVER use `npx prisma db push`** in any environment. It bypasses migration history
  and will desync production schemas silently.
- **NEVER run `migrate:reset` against production or staging.**
- Always commit the migration SQL file and the updated `schema.prisma` together in the
  same PR/commit.
- Migration files in `prisma/migrations/` are immutable once merged to main — never
  edit an already-applied migration. Create a new one instead.
- The `migrate:deploy` command is for production/CI. It never generates the client —
  that is handled by the `build` script.
