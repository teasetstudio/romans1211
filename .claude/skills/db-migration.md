# Database Migration Workflow

Schema: `prisma/schema.prisma`  
ORM: Prisma 6, PostgreSQL

---

## Standard workflow

### 1. Edit the schema

Open `prisma/schema.prisma` and make your changes.

Conventions in this project:
- IDs: `String @id @default(cuid())`
- Timestamps on every model: `createdAt DateTime @default(now())` + `updatedAt DateTime @updatedAt`
- Long text: `@db.Text`; short strings: `@db.VarChar(N)`
- Add `@@index([fieldName])` for any field used in `where`, `orderBy`, or relation lookups.

### 2. Create the migration file for review

```bash
yarn migrate:create <descriptive-name>
# Runs: npx prisma migrate dev --create-only --name <descriptive-name>
```

This writes `prisma/migrations/<timestamp>_<name>/migration.sql` without applying it.

### 3. Review the generated SQL

Open the migration file and check for:

| Red flag | What to do |
|---|---|
| `DROP COLUMN` | Confirm the column is truly unused; consider a two-phase migration (keep → backfill → drop). |
| `ALTER COLUMN ... SET NOT NULL` | Ensure every existing row has a value, or provide a `DEFAULT` in the SQL before the constraint. |
| `DROP TABLE` | Almost always wrong unless you explicitly removed a model. |
| `ALTER TYPE` (enum changes) | PostgreSQL requires casting; add an explicit CAST or split into two migrations. |
| Large-table index addition | Consider `CREATE INDEX CONCURRENTLY` in the migration SQL to avoid locking. |

### 4. Apply in development

```bash
yarn migrate
# Runs: npx prisma migrate dev --name <same-name>
# Also regenerates the Prisma client automatically.
```

If `prisma migrate dev` regenerates the client but your IDE still shows type errors, run:

```bash
npx prisma generate
```

### 5. Apply in production

```bash
yarn migrate:deploy
# Runs: npx prisma migrate deploy
```

`migrate:deploy` applies all pending migrations from `prisma/migrations/` without prompting and without generating the client. The client is generated at build time via `"build": "prisma generate && next build"`.

---

## When a data backfill is needed

If you are adding a NOT NULL column to a table that already has rows, or splitting/renaming data:

1. Create the migration with `yarn migrate:create <name>`.
2. Open the generated SQL file.
3. Edit the SQL to:
   a. Add the column as nullable first.
   b. Write an `UPDATE` statement to fill existing rows.
   c. Then `ALTER COLUMN ... SET NOT NULL`.

Example pattern:
```sql
-- Step 1: add nullable
ALTER TABLE "Song" ADD COLUMN "difficulty" INTEGER;

-- Step 2: backfill
UPDATE "Song" SET "difficulty" = 1 WHERE "difficulty" IS NULL;

-- Step 3: enforce constraint
ALTER TABLE "Song" ALTER COLUMN "difficulty" SET NOT NULL;
```

4. Apply with `yarn migrate`.

---

## Other commands

| Command | Purpose |
|---|---|
| `yarn migrate:status` | Show which migrations are applied vs. pending |
| `yarn migrate:reset` | **Destructive.** Drops the DB and re-applies all migrations. Dev only. |
| `yarn postgres` | Start the local PostgreSQL container via Docker Compose |

---

## Hard rules

- **NEVER use `npx prisma db push`** in any environment. It bypasses the migration history and will desync production.
- **NEVER run `migrate:reset` against production or staging.**
- Always commit the migration file alongside the schema change in the same PR.
- Migration files in `prisma/migrations/` are immutable once merged — never edit an already-applied migration.
