# i18n Strings — Adding and Managing Translation Keys

Stack: **next-intl 3.x**, source files in `messages/`, synced via **i18nexus** (`yarn messages`).

Supported locales: `en`, `ru`. Both files must always be in sync.

---

## Key naming conventions

Keys are nested JSON. Top-level namespaces map directly to the constants in `src/res/namespaces.ts`:

| Namespace constant | JSON top-level key | Used in |
|---|---|---|
| `NAMESPACE_COMMON` | `common` | Shared across the app |
| `NAMESPACE_DASHBOARD` | `dashboard` | Dashboard pages and forms |
| `NAMESPACE_DASHBOARD_COURSES` | `dashboard_courses` | Courses section |
| `NAMESPACE_DASHBOARD_EVENTS` | `dashboard_events` | Events section |
| `NAMESPACE_WIDGETS` | `widgets` | Widget components |
| `NAMESPACE_BANNERS` | `banners` | Banner components |
| `NAMESPACE_POPUPS` | `popups` | Popup/modal components |
| `NAMESPACE_HOME` | `home` | Home page |
| `NAMESPACE_CONTACT` | `contact` | Contact page |
| `NAMESPACE_ERRORS` | `error` | Error states |
| `NAMESPACE_USER_SETTINGS_PAGE` | `user_settings_page` | Settings page |

Naming rules inferred from existing keys:
- `snake_case` for all key names.
- Group related keys under a sub-object (e.g., `dashboard.form.title`, `dashboard.form.content`).
- Action labels: `create_material`, `save_changes`, `cancel`.
- Placeholder text: `title_song_placeholder`, `title_game_placeholder`.
- Status/state: `saving`, `loading`.
- Error messages: nested under `error` namespace or inline within the feature namespace.

---

## Adding a new key

### 1. Add to both locale files in the same commit

`messages/en.json`:
```json
"dashboard": {
  "form": {
    "your_new_key": "Your English label"
  }
}
```

`messages/ru.json`:
```json
"dashboard": {
  "form": {
    "your_new_key": "Ваш русский текст"
  }
}
```

If `ru.json` translation is not ready yet, use a placeholder — but never omit the key entirely, or next-intl will warn at runtime.

### 2. Sync with i18nexus (optional, when using the cloud dashboard)

```bash
yarn messages
# Runs: i18nexus pull
```

This overwrites local files with the cloud versions. Only run after pushing your keys to the i18nexus dashboard, or after a teammate has added translations there.

---

## Using keys in components

### Client components

```tsx
'use client';
import { useTranslations } from 'next-intl';
import { NAMESPACE_DASHBOARD } from '@/res/namespaces';

export default function MyComponent() {
  const t = useTranslations(NAMESPACE_DASHBOARD);
  return <label>{t('form.your_new_key')}</label>;
}
```

### Server components (async)

```tsx
import { getTranslations } from 'next-intl/server';
import { NAMESPACE_DASHBOARD } from '@/res/namespaces';

export default async function MyServerComponent() {
  const t = await getTranslations(NAMESPACE_DASHBOARD);
  return <h1>{t('form.your_new_key')}</h1>;
}
```

### Dynamic keys

```tsx
// Safe — only when the key suffix is a known union type
t(`form.language_${lang.id}`) // e.g. 'form.language_en', 'form.language_ru'
```

---

## Hard rules

- **Never hardcode user-facing strings.** All UI text must use a translation key.
- **Always update both `en.json` and `ru.json`** in the same commit/PR. A missing key in one file causes a runtime warning and falls back silently.
- **Always use the namespace constant** from `src/res/namespaces.ts` — never pass the string literal directly to `useTranslations`.
- **Never rename an existing key** without a global search and replace across all components that reference it.

---

## Finding missing or unused keys

Check all components referencing a namespace:
```bash
grep -r "NAMESPACE_DASHBOARD" src/ --include="*.tsx" --include="*.ts" -l
```

Check if a specific key is used anywhere:
```bash
grep -r "form\.your_new_key" src/ --include="*.tsx" --include="*.ts"
```

Find hardcoded strings in JSX (heuristic — text nodes with spaces, not in translation calls):
```bash
grep -rn ">[A-Z][a-z].*[a-z]</" src/components --include="*.tsx"
```
