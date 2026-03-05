# Christian Material Library

> *"Do not lag in zeal, be ardent in spirit, serve the Lord."* — Romans 12:11

**Christian Material Library** ([romans1211.com](https://www.romans1211.com/)) is an online library for Christian ministry resources, with a primary focus on **youth, teens, and children's ministry**. It is designed to help churches, youth leaders, Sunday school teachers, and children's ministry workers discover, organize, and contribute materials for their work with the next generation.

The library hosts three types of content:

- **Songs** — Christian songs, hymns, and spiritual music curated for youth worship, teen groups, and children's services.
- **Texts** — Sermons, Bible studies, and teaching materials tailored for Sunday school, teen groups, and children's ministry.
- **Games** — Interactive and engaging games built specifically for youth events, teen gatherings, camps, and Sunday school activities.

Users can browse the public catalog or log in to contribute their own materials, helping grow a shared resource base for those serving children and young people in Christian communities.

Built with **Next.js**, **Prisma**, and **PostgreSQL**.

---

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