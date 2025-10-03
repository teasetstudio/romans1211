'use client';

import { useRouter, usePathname } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import NProgress from "nprogress";

/**
 * Custom hook for navigation with NProgress integration
 * Handles the case where target URL is the same as current URL
 */
export const useNavigateWithProgress = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const navigateWithProgress = (targetUrl: string) => {
    NProgress.start();

    // Construct the full current URL including search parameters
    const currentUrl = searchParams.toString() 
      ? `${pathname}?${searchParams.toString()}`
      : pathname;

    // Check if target URL is the same as current URL
    if (currentUrl === targetUrl) {
      // If URLs are the same, complete progress after 100ms
      setTimeout(() => {
        NProgress.done();
      }, 100);
    }
    router.push(targetUrl);
  };

  const refreshWithProgress = () => {
    NProgress.start();

    setTimeout(() => {
      NProgress.done();
    }, 1000);
    router.refresh();
  };

  return { navigateWithProgress, refreshWithProgress };
};
