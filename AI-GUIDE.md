# How to Use AI in This Project

This project is configured for [Claude Code](https://claude.ai/code) — Anthropic's AI CLI/IDE tool. The setup lives in three places:

| File/Folder | What it does |
|---|---|
| `CLAUDE.md` | Auto-loaded context at every session start |
| `.claude/settings.json` | Permissions + automatic hooks |
| `.claude/skills/` | Step-by-step playbooks you invoke by name |
| `.claude/agents/` | Specialized reviewers Claude can delegate to |

---

## Getting started

Install Claude Code globally, then run it inside the repo:

```bash
npm install -g @anthropic-ai/claude-code
cd romans1211
claude
```

Or use the [web interface](https://claude.ai/code), desktop app, or VS Code/JetBrains extension.

When a session starts, `CLAUDE.md` is automatically read — Claude already knows the project stack, commands, architecture, and conventions from line one.

---

## What happens automatically (hooks)

These run without you asking:

| When | What runs |
|---|---|
| Session starts | `npm install --prefer-offline && npx prisma generate` — ensures types are fresh |
| After any file edit | `npx tsc --noEmit` — catches TypeScript errors immediately |

Pre-approved commands (no permission prompt):
`yarn lint`, `npx tsc`, `npx prisma generate`, `npx prisma migrate status`, common `git` read commands, `ls`, `find`.

---

## Skills — how to use them

Skills are playbooks for the most common tasks in this codebase. Invoke them by telling Claude which one to follow, or just describe what you want and Claude will pick the right one.

### `add-material-feature`
**When:** Adding a new field, attribute, or feature to songs, texts, or games.

```
"Add a 'duration' field to the Song material type. Follow the add-material-feature skill."
```

Covers: schema → migration → API → form → UI → both locale files.

---

### `db-migration`
**When:** Making any Prisma schema change.

```
"I need to add an index to the materials table. Use the db-migration skill."
```

Covers: safe create-only flow, reviewing SQL before applying, production deploy, data backfills.

---

### `i18n-strings`
**When:** Adding new UI text or checking translation coverage.

```
"Add the translation keys for the new filter label. Use the i18n-strings skill."
```

Covers: key naming conventions, updating both `en.json` and `ru.json`, namespace constants, server vs. client usage.

---

### `new-component`
**When:** Creating any new React component.

```
"Create a new StatusBadge component. Use the new-component skill."
```

Covers: which folder it belongs in, server vs. client decision, `clsx`/`twMerge`/`cva` patterns, i18n checklist.

---

## Agents — specialized reviewers

Agents are focused AI reviewers Claude can delegate to. They have read-only tools and a narrow job.

### `code-reviewer`
Reviews a diff for convention violations before you commit or open a PR.

```
"Review my changes with the code-reviewer agent."
```

Checks for: hardcoded strings (should be in i18n files), missing Zod validation on API routes, missing auth session checks, `en.json`/`ru.json` drift, schema changes without a migration, `any` usage.

---

### `i18n-auditor`
Full codebase scan for translation issues.

```
"Run the i18n-auditor on the whole codebase."
```

Checks for: hardcoded user-visible strings in TSX/TS files, keys that exist in `en.json` but not `ru.json` or vice versa, incorrect namespace usage.

---

### `db-guardian`
Reviews migration SQL before you apply it.

```
"Before I run this migration, have db-guardian check it."
```

Checks for: `DROP TABLE`, `DROP COLUMN`, type changes, `NOT NULL` on existing columns, missing data backfills. Returns a **GO / GO WITH CAUTION / NO-GO** verdict.

---

## Typical workflows

### Adding a new feature
```
1. Describe the feature to Claude
2. Claude follows add-material-feature skill automatically
3. Before committing: "Review my changes with code-reviewer"
4. Commit and push
```

### Changing the database schema
```
1. "I need to change X in the schema. Use db-migration skill."
2. Claude creates migration with --create-only so you review the SQL first
3. "Have db-guardian check this migration before I apply it."
4. Apply after approval
```

### Checking translation health
```
"Run the i18n-auditor before I open a PR."
```

### Adding a component
```
"Create a LoadingCard component for the material grid. Use new-component skill."
```

---

## Tips

- **Claude reads `CLAUDE.md` automatically** — you don't need to explain the stack, auth patterns, or conventions each session.
- **Name the skill explicitly** when you want guaranteed adherence: *"use the db-migration skill"*. Otherwise Claude uses its judgment.
- **Agents are invoked on demand** — Claude routes to them when you ask for a review or audit.
- **Both locale files always** — whenever you add a translation key, both `messages/en.json` and `messages/ru.json` must be updated in the same commit. The `code-reviewer` agent will flag if only one was changed.
- **No test suite** — the verification gate is `yarn lint` + `npx tsc --noEmit`. The PostToolUse hook runs tsc automatically after edits.
