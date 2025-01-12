Node version v20.6.1 (npm v9.8.1)

## Getting Started

First, run the development server:

```bash
# Start postgres (for dev, need Docker)
yarn postgres
# Start dev
yarn dev

```

## Database
```bash
# Updates the database schema without migrations (only for development, NOT PRODUCTION, use npx prisma migrate deploy instead for production):
npx prisma db push
npx prisma db push --accept-data-loss # Ignore data loss warnings
npx prisma db push --force-reset  # Force a reset of the database before push_

# UPDATE PRISMA CLIENT AFTER MODIFICATIONS:
# (restart IDE after using this command)
npx prisma generate

# Create migration
# init - just a name. The same way you create follow-up migrations
npx prisma migrate dev --name init

# Reset Migrations (only for development - removes all data)
npx prisma migrate reset

# Deploy migrations to production
npx prisma migrate deploy

# Prisma seed
npx prisma db seed

```