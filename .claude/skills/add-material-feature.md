# Add a Field or Feature to a Material Type

Material types are **song**, **text**, and **game**. All three share the same API surface (`/api/materials`, `/api/materials/[id]`), use a unified `MaterialForm`, and have type-specific sub-forms in `src/components/forms/`.

---

## 1. Prisma schema change

File: `prisma/schema.prisma`

1. Locate the target model (`Song`, `Text`, or `Game` — all three are structurally identical except `Game` also has a `preparations` relation).
2. Add the new field. Mirror the existing field conventions:
   - Use `@db.VarChar(1000)` for short strings, `@db.Text` for long strings.
   - Mark optional fields with `?`.
   - Add `@default(...)` for booleans and numeric fields.
   - Add `@@index([fieldName])` for any field that will be filtered or sorted.
3. If adding a field to all three types, repeat the addition in `Song`, `Text`, and `Game`.

---

## 2. Create and review the migration

```bash
yarn migrate:create <descriptive-name>
# example: yarn migrate:create add-difficulty-to-game
```

- Open the generated file in `prisma/migrations/<timestamp>_<name>/migration.sql`.
- Check for unintended `DROP`, `ALTER TYPE`, or nullable-to-not-null changes.
- Only proceed once the SQL looks correct.

Apply:

```bash
yarn migrate
```

Regenerate the Prisma client:

```bash
npx prisma generate
```

---

## 3. API route update

**POST** (`src/app/api/materials/route.ts`):
- Destructure the new field from `body` alongside `title`, `content`, etc.
- Add it to the `prisma[type].create({ data: { ... } })` call.
- If the field is type-specific (e.g., only `game`), guard it with `...(type === 'game' && { fieldName })` — mirror the existing `preparations` pattern.

**PUT** (`src/app/api/materials/[id]/route.ts`):
- Destructure from `req.json()` alongside `title`, `content`, etc.
- Add it to the `updateData` object passed to `materialApiService.update(...)`.

**GET** — usually no change needed; the Prisma query returns all scalar fields by default. Add to `include` only if the field is a relation.

Validation: this codebase does manual field checks (`if (!title || !content ...)`) rather than Zod at the route level. Add a guard if the new field is required.

---

## 4. Form update

**Type-specific sub-form** (`src/components/forms/SongMaterialForm.tsx`, `TextMaterialForm.tsx`, or `GameMaterialForm.tsx`):
- The sub-forms receive `title`, `content`, and type-specific extras as props.
- Add the new prop to the interface, wire a controlled `<input>` or other element, and use `t('form.<key>')` for the label.
- Follow the exact className pattern already present: `w-full px-4 py-2 bg-white border border-gray-200 rounded-lg ...`.

**Parent form** (`src/components/forms/MaterialForm.tsx`):
- Add the new field to `ISubmitData` and `MaterialFormProps.initialData`.
- Add a `useState` for it, initialized from `initialData`.
- Pass it down to the sub-form.
- Include it in the `onSubmit` call object.

**API client** (`src/api/requests/materials.ts`):
- Add the field to `IPostMaterialBody` and `IMaterialResponse`.

---

## 5. List / detail UI update

- **Card components**: `src/components/CardGrid/SongCard.tsx`, `TextCard.tsx`, `GameCard.tsx` — add the field to props/display if it should appear in list view.
- **Detail page**: `src/app/[locale]/dashboard/library/material/[type]/[id]/page.tsx` — add the field to the detail view.
- **Edit page**: `src/app/[locale]/dashboard/library/material/[type]/[id]/edit/page.tsx` — pass `initialData` with the new field.

---

## 6. Translation keys

Both files must be updated in the same commit.

`messages/en.json` — add under the `dashboard.form` namespace:
```json
"dashboard": {
  "form": {
    "your_new_field_label": "Your Label"
  }
}
```

`messages/ru.json` — add the same key with the Russian translation.

Use the key in components:
```tsx
const t = useTranslations(NAMESPACE_DASHBOARD); // 'dashboard'
t('form.your_new_field_label')
```

---

## 7. Pattern checklist

- [ ] Schema field added to correct model(s)
- [ ] Migration created with `--create-only`, SQL reviewed, then applied
- [ ] `npx prisma generate` run after schema change
- [ ] Field destructured in POST route, added to `create` data
- [ ] Field destructured in PUT route, added to `updateData`
- [ ] Sub-form prop + controlled input added
- [ ] `ISubmitData` and `MaterialFormProps.initialData` updated in `MaterialForm`
- [ ] `IPostMaterialBody` / `IMaterialResponse` updated in `src/api/requests/materials.ts`
- [ ] Both `en.json` and `ru.json` updated
