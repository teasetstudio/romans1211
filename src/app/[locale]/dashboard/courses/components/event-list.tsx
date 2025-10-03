"use client";

import { useTranslations } from "next-intl";
import { Event } from "@prisma/client";
import { format, isToday, isTomorrow, isYesterday, isThisYear } from "date-fns";
import { Text } from "@/components/typo/Text";
import { NAMESPACE_DASHBOARD_COURSES } from "@/res/namespaces";

interface EventListProps {
  events: Event[];
  onEdit: (id: string) => void;
}

export function EventList({ events, onEdit }: EventListProps) {
  const t = useTranslations(NAMESPACE_DASHBOARD_COURSES);

  // Helper function to format dates in a more readable way
  const formatEventDateTime = (date: Date) => {
    
    // For dates today, tomorrow, or yesterday - show relative day + time
    if (isToday(date)) {
      return `${t("date.today")} ${format(date, "HH:mm")}`;
    }
    if (isTomorrow(date)) {
      return `${t("date.tomorrow")} ${format(date, "HH:mm")}`;
    }
    if (isYesterday(date)) {
      return `${t("date.yesterday")} ${format(date, "HH:mm")}`;
    }
    
    // For dates in the current year - show short month, day, and time
    if (isThisYear(date)) {
      return format(date, "MMM d, HH:mm");
    }
    
    // For dates in other years - include the year
    return format(date, "MMM d, yyyy HH:mm");
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t("table.title")}
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t("table.startTime")}
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t("table.endTime")}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {events.map((event) => (
            <tr 
              key={event.id}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => onEdit(event.id)}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <Text>{event.title}</Text>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Text>{formatEventDateTime(new Date(event.startTime))}</Text>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Text>{formatEventDateTime(new Date(event.endTime))}</Text>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
