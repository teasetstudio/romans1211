'use client';

import { useRouter  } from "next/navigation";
import { useLocale } from "next-intl";

export default function LanguageChanger() {
  const router = useRouter();
  const locale = useLocale();

  const handleChange = (e: any) => {
    const newLocale = e.target.value;
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`
    router.refresh()
  };

  return (
    <select value={locale} onChange={handleChange}>
      <option value="en">English</option>
      <option value="ru">Russian</option>
    </select>
  );
}