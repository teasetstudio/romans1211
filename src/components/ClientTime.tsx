"use client";

import { format } from "date-fns";

interface ClientTimeProps {
  date: string | Date;
  formatStr?: string;
}

export function ClientTime({ date, formatStr = "MMM d, HH:mm" }: ClientTimeProps) {
  // Convert to Date object and format on client side to use local timezone
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return <span>{format(dateObj, formatStr)}</span>;
}
