"use client";

import { useTranslations } from "next-intl";
import { Event } from "@prisma/client";
import { format } from "date-fns";
import Button from "@/components/buttons/Button";
import { Text } from "@/components/typo/Text";
import { IconTrash } from "@tabler/icons-react";
import { NAMESPACE_DASHBOARD_COURSES } from "@/res/namespaces";

interface EventListProps {
  events: Event[];
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  hasDeletePermission: boolean;
}

export function EventList({ events, onDelete, onEdit, hasDeletePermission }: EventListProps) {
  const t = useTranslations(NAMESPACE_DASHBOARD_COURSES);

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
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t("table.location")}
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t("table.status")}
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">{t("table.actions")}</span>
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
                <Text>{format(new Date(event.startTime), "PPP p")}</Text>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Text>{format(new Date(event.endTime), "PPP p")}</Text>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Text>{event.location || "-"}</Text>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  event.isCancelled 
                    ? "bg-red-100 text-red-800" 
                    : "bg-green-100 text-green-800"
                }`}>
                  {event.isCancelled ? t("cancelled") : t("active")}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                {hasDeletePermission && (
                  <div className="flex justify-center">
                    <Button
                      bgColor="bg-transparent"
                      size="sm"
                      paddingClass="p-1"
                      className="text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full w-10 h-10 flex items-center justify-center transition-all !min-w-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(event.id);
                      }}
                    >
                      <IconTrash size={20} />
                    </Button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
