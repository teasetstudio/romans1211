# Skill: New Component

## 1. Choose the right folder

| Folder | What belongs there |
|---|---|
| `components/ui/` | Generic primitives (Tooltip, Modal, Spinner) — no domain logic |
| `components/badges/` | Small inline labels (TagBadge, VisibilityBadge, LangBadge) |
| `components/buttons/` | Button variants |
| `components/banners/` | Full-width notification/alert strips |
| `components/dialogs/` | Modal dialogs, confirmation prompts |
| `components/forms/` | Full form compositions (create/edit material, auth forms) |
| `components/inputs/` | Individual form inputs (text field, select, file upload) |
| `components/popups/` | Floating panels, dropdowns, context menus |
| `components/tabs/` | Tab navigation components |
| `components/typo/` | Typography scale components (H1–H11) |
| `components/widgets/` | Domain-specific composed widgets (catalog filter, card header) |
| `components/CardGrid/` | Grid layout for material cards |
| `components/client/` | Client-only wrappers (browser APIs, window/document access) |
| `components/contexts/` | React context providers |

## 2. Server vs. client — decision rule

Default to **server component** (no directive needed).

Add `'use client'` at the top when the component:
- Uses `useState`, `useEffect`, `useRef`, `useReducer`
- Attaches event handlers (`onClick`, `onChange`, etc.)
- Uses `useTranslations` from next-intl (client-side)
- Accesses browser APIs (`window`, `document`, `navigator`)
- Uses third-party hooks (react-hook-form, etc.)

For server components needing translations, use `getTranslations()` (async) from `next-intl/server`.

## 3. Anatomy of a component

Follow the existing pattern — no unnecessary imports, interface named `IProps`:

```tsx
// Server component (no directive)
import SomeChild from '@/components/...'

interface IProps {
  label: string
  className?: string
}

const MyComponent = ({ label, className }: IProps) => {
  return (
    <div className={`base-classes ${className ?? ''}`}>
      {label}
    </div>
  )
}

export default MyComponent
```

```tsx
'use client'
// Client component
import { useState } from 'react'

interface IProps {
  initialValue: string
}

const MyClientComponent = ({ initialValue }: IProps) => {
  const [value, setValue] = useState(initialValue)
  return <input value={value} onChange={e => setValue(e.target.value)} />
}

export default MyClientComponent
```

## 4. Tailwind conventions

- Use `className` string concatenation for conditional classes: `` `base ${condition ? 'a' : 'b'}` ``
- Use `tailwind-merge` (`twMerge`) when the parent might pass conflicting classes via `className` prop
- Responsive breakpoints in use: `small:`, `md:`, `lg:` — check `tailwind.config.ts` for custom breakpoints
- Don't use arbitrary values unless there's no alternative

## 5. i18n — when you need translation keys

If the component renders user-facing text (labels, placeholders, error messages):

**Client component:**
```tsx
'use client'
import { useTranslations } from 'next-intl'
import { Namespaces } from '@/res/namespaces'  // check this file for existing namespaces

const MyComponent = () => {
  const t = useTranslations(Namespaces.MyNamespace)
  return <button>{t('submit')}</button>
}
```

**Server component:**
```tsx
import { getTranslations } from 'next-intl/server'

const MyComponent = async () => {
  const t = await getTranslations('MyNamespace')
  return <h1>{t('title')}</h1>
}
```

Always add the key to **both** `messages/en.json` and `messages/ru.json` in the same commit.

## 6. Export convention

All components use default export. Re-export from an `index.ts` barrel only if the folder already has one.

## 7. Checklist before finishing

- [ ] Correct folder for the component type
- [ ] `'use client'` only if truly needed
- [ ] Props typed with `IProps` interface
- [ ] `className?: string` forwarded if it's a presentational component
- [ ] All user-facing strings use next-intl (no hardcoded English)
- [ ] Both `en.json` and `ru.json` updated if new keys added
