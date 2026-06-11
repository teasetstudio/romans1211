# i18n Strings — Adding and Managing Translation Keys

Stack: **next-intl 3.x** | Locale files: `messages/en.json`, `messages/ru.json`  
Cloud sync: **i18nexus** (`yarn messages` pulls from the cloud dashboard)  
Supported locales: `en` and `ru`. Both files must always be in sync.

---

## Namespace map

Top-level JSON keys map 1-to-1 with the constants in `src/res/namespaces.ts`:

| Constant | JSON key | Scope |
|---|---|---|
| `NAMESPACE_COMMON` | `common` | Shared app-wide (auth strings, errors, footer, header, pagination) |
| `NAMESPACE_DASHBOARD` | `dashboard` | Dashboard library pages and all material forms |
| `NAMESPACE_DASHBOARD_COURSES` | `dashboard_courses` | Courses section |
| `NAMESPACE_DASHBOARD_EVENTS` | `dashboard_events` | Events section |
| `NAMESPACE_WIDGETS` | `widgets` | Widget components (catalog filter, cards) |
| `NAMESPACE_BANNERS` | `banners` | Banner components |
| `NAMESPACE_POPUPS` | `popups` | Popup / modal components |
| `NAMESPACE_HOME` | `home` | Home page |
| `NAMESPACE_CONTACT` | `contact` | Contact page |
| `NAMESPACE_ERRORS` | `error` | Error states (inside `common.error`) |
| `NAMESPACE_USER_SETTINGS_PAGE` | `user_settings_page` | Settings page |
| `NAMESPACE_AD_MANAGER_PAGE` | `ad_manager_page` | Ad manager page |

---

## Key naming conventions (inferred from `messages/en.json`)

- All key names are `snake_case`.
- Sub-objects group related keys: `dashboard.form.title`, `dashboard.form.content`.
- Form labels: `title`, `content`, `language`, `tags`, `visibility`.
- Placeholder text: suffix `_placeholder` — e.g. `title_song_placeholder`.
- Action buttons: `create_material`, `save_changes`, `cancel`, `delete`, `edit`.
- Status/loading: `saving`, `deleting`, `loading`.
- Dynamic values use ICU syntax: `"no_materials": "No {type} created yet"` →
  `t('no_materials', { type: 'song' })`.
- Language options: `language_en`, `language_ru`, `language_lt`, `language_pl`.

---

## Adding a new key

### 1. Add to both locale files in the same commit

`messages/en.json`:
```json
"dashboard": {
  "form": {
    "difficulty": "Difficulty",
    "difficulty_placeholder": "e.g. easy, medium, hard"
  }
}
```

`messages/ru.json`:
```json
"dashboard": {
  "form": {
    "difficulty": "Сложность",
    "difficulty_placeholder": "напр. лёгкий, средний, сложный"
  }
}
```

If the Russian translation is not ready, use a temporary English placeholder rather
than omitting the key — next-intl warns at runtime when a key is missing.

### 2. Sync with i18nexus (when using the cloud dashboard)

```bash
yarn messages
# runs: i18nexus pull
# OVERWRITES local files with cloud content
```

Only run after pushing your keys to the i18nexus cloud dashboard, or when pulling
translations added by teammates there. Never run this to discard local changes.

---

## Using keys in components

### Client components — `useTranslations`

```tsx
'use client';
import { useTranslations } from 'next-intl';
import { NAMESPACE_DASHBOARD } from '@/res/namespaces';

export default function MyForm() {
  const t = useTranslations(NAMESPACE_DASHBOARD);
  return (
    <label>
      {t('form.difficulty')}
      <input placeholder={t('form.difficulty_placeholder')} />
    </label>
  );
}
```

### Server components (async) — `getTranslations`

```tsx
import { getTranslations } from 'next-intl/server';
import { NAMESPACE_DASHBOARD } from '@/res/namespaces';

export default async function MyPage() {
  const t = await getTranslations(NAMESPACE_DASHBOARD);
  return <h1>{t('create_new_material')}</h1>;
}
```

### Dynamic key segments

```tsx
// Safe only when the suffix is a known bounded union
t(`form.language_${lang.id}`)  // 'form.language_en', 'form.language_ru', etc.
```

### ICU interpolation

```tsx
// Key: "no_materials": "No {type} created yet"
t('no_materials', { type: 'songs' })  // → "No songs created yet"
```

---

## Hard rules

- **Never hardcode user-facing strings.** All UI text must use a translation key.
- **Always update both `en.json` and `ru.json`** in the same commit. A missing key
  causes a silent fallback and a runtime warning.
- **Always use the constant** from `src/res/namespaces.ts` — never pass a string literal
  directly to `useTranslations('dashboard')`.
- **Never rename an existing key** without a global search-and-replace across all
  components that reference it.
- **Never call `useTranslations` in a server component** — use `getTranslations` instead.

---

## Finding missing or unused keys

All components using a namespace:
```bash
grep -r "NAMESPACE_DASHBOARD" src/ --include="*.tsx" --include="*.ts" -l
```

Check if a specific key is referenced anywhere:
```bash
grep -r "form\.difficulty" src/ --include="*.tsx" --include="*.ts"
```

Hunt for hardcoded UI strings (heuristic — JSX text nodes with spaces):
```bash
grep -rn ">[A-Z][a-z][a-z ]*</" src/components --include="*.tsx"
```

Check keys present in `en.json` but missing from `ru.json` (requires `jq`):
```bash
diff <(jq -r 'paths(scalars) | join(".")' messages/en.json | sort) \
     <(jq -r 'paths(scalars) | join(".")' messages/ru.json | sort)
```
