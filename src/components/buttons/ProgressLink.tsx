"use client";

import NProgress from "nprogress";
import { Link } from "@/i18n/routing";
import { usePathname } from "next/navigation";

// Custom Link component with NProgress integration
export const ProgressLink = ({ onClick, href, ...props }: any) => {
  const pathname = usePathname();

  const handleClick = (event: any) => {
    // Start NProgress on link click
    NProgress.start();

    // Check if we're navigating to the same page
    const targetPath = href?.toString() || '';
    const currentPath = pathname;

    // If navigating to the same page, complete progress immediately
    if (targetPath === currentPath || (targetPath === '/' && currentPath === '/')) {
      setTimeout(() => {
        NProgress.done();
      }, 100); // Small delay to show the progress bar briefly
    }

    // Call the original onClick if provided
    if (onClick) {
      onClick(event);
    }
  };

  return <Link onClick={handleClick} href={href} {...props} />;
};
