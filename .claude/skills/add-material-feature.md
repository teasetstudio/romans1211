# Add a Field or Feature to a Material Type (Song / Text / Game)

Material types are `song`, `text`, and `game`. All three share the same API surface
(`/api/materials`, `/api/materials/[id]`), a unified `MaterialForm`, and type-specific
sub-forms in `src/components/forms/`. Mirror existing patterns exactly.

---

## 1. Prisma schema change

File: `prisma/schema.prisma`

1. Locate the target model (`Song`, `Text`, or `Game`). All three are structurally
   identical; `Game` additionally has a `GamePreparation` child relation.
2. Add the field following existing conventions:
   - Short strings: `@db.VarChar(1000)`. Long strings: `@db.Text`.
   - Optional fields: append `?`.
   - Booleans and numerics: always add `@default(...)`.
   - Add `@@index([fieldName])` for any field that appears in `where` or `orderBy`.
3. If the field applies to all three types, add it to `Song`, `Text`, and `Game`.

---

## 2. Create and review the migration

```bash
yarn migrate:create <descriptive-name>
# runs: npx prisma migrate dev --create-only --name <descriptive-name>
```

Open the generated file at `prisma/migrations/<timestamp>_<name>/migration.sql`.
Review for:
- Unintended `DROP COLUMN` or `DROP TABLE`
- `ALTER COLUMN … SET NOT NULL` on a populated table without a prior `DEFAULT`
- `ALTER TYPE` on an enum (PostgreSQL requires explicit casting)

Apply after review:

```bash
yarn migrate
# runs: npx prisma migrate dev --name <same-name>
```

Then regenerate the Prisma client (always required after a schema change):

```bash
npx prisma generate
```

---

## 3. API route update

**POST** — `src/app/api/materials/route.ts`

1. Destructure the new field from `body` alongside `title`, `content`, `isPublic`, etc.
2. Add it to the `prisma[type].create({ data: { ... } })` call.
3. For type-specific fields, guard with `...(type === 'game' && { fieldName })` —
   see the existing `preparations` handling as the exact pattern.
4. Add a manual `if (!newField)` guard if the field is required (routes use manual
   checks, not Zod).

**PUT** — `src/app/api/materials/[id]/route.ts`

1. Destructure from `await req.json()` alongside `title`, `content`, etc.
2. Add it to the `updateData` object passed to `materialApiService.update(...)`.

**GET** — no change needed for scalar fields; Prisma returns all scalars by default.
Add to the `include` block only when the field is a relation.

---

## 4. Client-side request types

File: `src/api/requests/materials.ts`

- Add the field to `IPostMaterialBody`.
- Add the field to `IMaterialResponse` and `IMaterialResponse2` (both exist; update both
  or consolidate them if the opportunity arises).

---

## 5. Form update

The form layer is split across:

| File | Responsibility |
|---|---|
| `src/components/forms/MaterialForm.tsx` | Shared wrapper: language, tags, visibility, type tabs, `ISubmitData` |
| `src/components/forms/TextMaterialForm.tsx` | Title + TipTap editor for text |
| `src/components/forms/SongMaterialForm.tsx` | Title + TipTap editor for song |
| `src/components/forms/GameMaterialForm.tsx` | Title + TipTap editor + preparations list |

**For a field shared by all types** (e.g. a new metadata toggle):
- Add a `useState` in `MaterialForm.tsx`, initialized from `initialData`.
- Add the field to `ISubmitData` and `MaterialFormProps.initialData`.
- Include it in the `await onSubmit({ ... })` call.
- Render the control in the "Settings Section" block (below the sub-form tabs).

**For a type-specific field** (e.g. a game-only field):
- Add a new prop + callback to the relevant `*MaterialForm.tsx` (`onXxxChange`).
- Add a `useState` in `MaterialForm.tsx`, pass it via the callback prop.
- Include it in the submit payload guarded by type: `...(activeTab === 'game' && { xxx })`.

`MaterialForm` uses plain `useState` — **not** react-hook-form. New standalone forms
(dialogs, settings) should use react-hook-form + Zod, following the pattern in
`src/components/popups/AuthPopup/LoginForm.tsx`.

Input class pattern to follow (copy exactly):
```
w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-800
placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1
focus:ring-primary transition-colors
```

---

## 6. List and detail UI update

**Card components** — `src/components/CardGrid/SongCard.tsx`, `TextCard.tsx`, `GameCard.tsx`  
Add the field to the card props and display it if it should appear in list view.

**Detail page** — `src/app/[locale]/dashboard/library/material/[type]/[id]/page.tsx`  
Add the field to the detail layout.

**Edit page** — `src/app/[locale]/dashboard/library/material/[type]/[id]/edit/page.tsx`  
Ensure the new field is included in the `initialData` passed to `MaterialForm`
(see `src/app/[locale]/dashboard/library/components/EditForm.tsx` for the pattern).

**Public catalog detail** — `src/app/[locale]/(auth)/(public)/library-catalog/material/[type]/[id]/page.tsx`  
Update if the field should be visible to non-authenticated users.

---

## 7. Translation keys

Add to **both** files in the same commit:

`messages/en.json`:
```json
"dashboard": {
  "form": {
    "your_new_field": "Your Label",
    "your_new_field_placeholder": "Enter..."
  }
}
```

`messages/ru.json`:
```json
"dashboard": {
  "form": {
    "your_new_field": "Ваш заголовок",
    "your_new_field_placeholder": "Введите..."
  }
}
```

In components:
```tsx
// Client component
const t = useTranslations(NAMESPACE_DASHBOARD); // from '@/res/namespaces'
<label>{t('form.your_new_field')}</label>
<input placeholder={t('form.your_new_field_placeholder')} />
```

---

## 8. Checklist

- [ ] Field added to correct model(s) in `schema.prisma`
- [ ] Migration created with `--create-only`, SQL reviewed, then `yarn migrate` applied
- [ ] `npx prisma generate` run
- [ ] New field destructured in POST route and added to `create` data
- [ ] New field destructured in PUT route and added to `updateData`
- [ ] `IPostMaterialBody` and `IMaterialResponse`/`IMaterialResponse2` updated
- [ ] Sub-form props and controlled input added
- [ ] `ISubmitData` and `MaterialFormProps.initialData` updated in `MaterialForm`
- [ ] Card and detail UI updated
- [ ] `en.json` and `ru.json` both updated with `snake_case` keys
- [ ] No hardcoded user-facing strings
