"use client";

import NProgress from "nprogress";
import { Link } from "@/i18n/routing";

// Custom Link component with NProgress integration
export const ProgressLink = ({ onClick, ...props }: any) => {
  const handleClick = (event: any) => {
    // Start NProgress on link click
    NProgress.start();
    
    // Call the original onClick if provided
    if (onClick) {
      onClick(event);
    }
  };

  return <Link onClick={handleClick} {...props} />;
};
