// import { Lang } from "@/types/Lang";
import { getRequestConfig } from "next-intl/server";
// import { cookies } from "next/headers";
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // const cookieStore = await cookies();
  // const locale = cookieStore.get("NEXT_LOCALE")?.value || Lang.en;

  // const isValidLocale = Object.values(Lang).includes(locale as Lang);
  // const validLocale = isValidLocale ? locale : Lang.en;

  // return {
  //   locale,
  //   messages: (await import(`../../messages/${validLocale}.json`)).default,
  // };
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }
 
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});
