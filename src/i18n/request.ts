import { Lang } from "@/types/Lang";
import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || Lang.en;

  const isValidLocale = Object.values(Lang).includes(locale as Lang);
  const validLocale = isValidLocale ? locale : Lang.en;

  return {
    locale,
    messages: (await import(`../../messages/${validLocale}.json`)).default,
  };
});
