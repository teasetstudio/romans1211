'use client';

import { useRouter, usePathname } from "@/i18n/routing";
import NProgress from "nprogress";

/**
 * Custom hook for navigation with NProgress integration
 * Handles the case where target URL is the same as current URL
 */
export const useNavigateWithProgress = () => {
  const router = useRouter();
  const pathname = usePathname();

  const navigateWithProgress = (targetUrl: string) => {
    NProgress.start();

    // Check if target URL is the same as current URL
    if (pathname === targetUrl) {
      // If URLs are the same, complete progress after 100ms
      setTimeout(() => {
        NProgress.done();
      }, 100);
    }
    router.push(targetUrl);
  };

  return { navigateWithProgress };
};
