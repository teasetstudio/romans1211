# Scaffolding a New Component

---

## 1. Choose the right folder

| Folder | What belongs there | Example files |
|---|---|---|
| `components/ui/` | Generic primitives with no domain logic | `Tooltip.tsx` |
| `components/badges/` | Small inline status labels | `MaterialTypeBadge`, `VisibilityBadge`, `LangBadge`, `TagBadge` |
| `components/buttons/` | Button and link variants | `Button`, `DeleteButton`, `WideLink`, `BurgerBtn` |
| `components/banners/` | Full-width marketing/info strips | `TopBanner`, `FooterCTABanner` |
| `components/dialogs/` | Modal dialogs, confirmation prompts | `ConfirmDialog` |
| `components/forms/` | Full form compositions | `MaterialForm`, `GameMaterialForm` |
| `components/inputs/` | Individual controlled inputs | `TextInput`, `TextEditor`, `DatePicker` |
| `components/popups/` | Floating panels, dropdowns | `UserDropdown`, `AuthPopup`, `ChangeLangMenu` |
| `components/tabs/` | Tab navigation | `TabGroup` |
| `components/typo/` | Typography scale (H1–H11, Text) | `H1`, `H2`, `Text` |
| `components/widgets/` | Domain-specific composed blocks | `Pagination`, `SongWidget`, `ActiveLibraryFilters` |
| `components/widgets/ui/` | Layout chrome used inside dashboard | `Header`, `Sidebar`, `Footer`, `Spinner` |
| `components/CardGrid/` | Material card and grid layouts | `SongCard`, `GameGrid` |
| `components/client/` | Client-only wrappers (browser APIs) | `LogoutBtn` |
| `components/contexts/` | React context providers | `OrganizationContext`, `ClientSessionProvider` |

If none of the above fits, place it in the closest logical parent. Avoid creating new
top-level folders.

---

## 2. Server vs. client — decision rule

Default to a **server component** (no directive).

Add `'use client'` at the top of the file when the component:
- Uses `useState`, `useEffect`, `useRef`, `useReducer`, or any other client hook
- Attaches event handlers (`onClick`, `onChange`, `onSubmit`, etc.)
- Calls `useTranslations` from next-intl (client-side hook)
- Accesses browser APIs (`window`, `document`, `navigator`, `localStorage`)
- Uses third-party client hooks (react-hook-form, headlessui, etc.)
- Imports any component that itself has `'use client'` and cannot be passed as a prop

For server components needing translations, use `getTranslations()` (async) from
`next-intl/server`.

---

## 3. Tailwind and class utility patterns

This project uses three approaches — match what already exists in the folder:

**Plain `clsx`** (most common — used in `MaterialTypeBadge`, `MaterialForm`):
```tsx
import clsx from 'clsx';

<div className={clsx(
  'base-classes',
  condition && 'conditional-class',
  variant === 'danger' && 'bg-red-100 text-red-700',
)}>
```

**`twMerge`** (used in `TextInput` and inputs that accept an override `className` prop):
```tsx
import { twMerge } from 'tailwind-merge';

<input className={twMerge(
  'block w-full px-4 py-2 border border-gray-300 rounded-lg',
  error && 'border-red-500',
  className,  // caller override — twMerge deduplicates conflicts
)} />
```

**`cva`** (`class-variance-authority`) is installed but used sparingly. Use it for
components with multiple independent variant axes (e.g. size × color × state).

**Standard Tailwind breakpoints in use:** `sm:`, `md:`, `lg:`. Check `tailwind.config.ts`
for custom values before reaching for arbitrary `[value]` syntax.

**Primary color token:** `bg-primary`, `text-primary`, `border-primary`, `ring-primary` —
defined in `tailwind.config.ts`. Use these instead of a hardcoded color.

---

## 4. Component anatomy

Follow the existing pattern: `IProps` interface, default export, no barrel unless the
folder already has an `index.ts`.

**Server component:**
```tsx
import { getTranslations } from 'next-intl/server';
import { NAMESPACE_DASHBOARD } from '@/res/namespaces';

interface IProps {
  title: string;
  className?: string;
}

export default async function MyCard({ title, className }: IProps) {
  const t = await getTranslations(NAMESPACE_DASHBOARD);
  return (
    <div className={`rounded-lg border p-4 ${className ?? ''}`}>
      <h2>{t('some_key')}</h2>
      <p>{title}</p>
    </div>
  );
}
```

**Client component:**
```tsx
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { NAMESPACE_DASHBOARD } from '@/res/namespaces';
import clsx from 'clsx';

interface IProps {
  initialValue: string;
  onSave: (value: string) => void;
  className?: string;
}

export default function MyInput({ initialValue, onSave, className }: IProps) {
  const t = useTranslations(NAMESPACE_DASHBOARD);
  const [value, setValue] = useState(initialValue);

  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder={t('form.some_placeholder')}
      className={clsx(
        'w-full px-4 py-2 bg-white border border-gray-200 rounded-lg',
        'focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary',
        className,
      )}
    />
  );
}
```

**Dialog / modal** — use headlessui `Dialog` (already a project dependency), following
`src/components/dialogs/ConfirmDialog.tsx` as the template.

**Form with validation** — use react-hook-form + Zod resolver (both installed). Follow
`src/components/popups/AuthPopup/LoginForm.tsx` for the pattern.

---

## 5. i18n — when translation keys are needed

Any component that renders user-visible text must use translation keys.

1. Add the key to both `messages/en.json` and `messages/ru.json` in the same commit
   (see `i18n-strings.md` for key naming rules).
2. Import the correct namespace constant from `src/res/namespaces.ts`.
3. Use `useTranslations` (client) or `getTranslations` (server).

Never pass a string literal directly — use the constant:
```tsx
// Wrong
const t = useTranslations('dashboard');

// Correct
const t = useTranslations(NAMESPACE_DASHBOARD);
```

---

## 6. Export convention

- All components use **default export**.
- Do not create a barrel `index.ts` unless the folder already has one.
- Name the file and the exported function identically: `MyComponent.tsx` exports
  `export default function MyComponent(...)`.

---

## 7. Checklist before finishing

- [ ] Placed in the correct folder for its kind
- [ ] `'use client'` added only when genuinely needed
- [ ] Props typed with an `IProps` interface
- [ ] `className?: string` forwarded if it is a presentational/wrapper component
- [ ] Correct class utility used: `clsx` (logic), `twMerge` (when merging caller overrides), `cva` (multi-axis variants)
- [ ] No hardcoded user-facing strings — all text via next-intl
- [ ] Both `en.json` and `ru.json` updated if new keys were added
- [ ] Default export, file name matches component name
