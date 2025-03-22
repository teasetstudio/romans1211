"use client"

import { EventCourse } from "@prisma/client";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { IconTrash, IconEdit } from "@tabler/icons-react";
import Button from "@/components/buttons/Button";
import { Text } from "@/components/typo/Text";

interface CourseListProps {
  courses: EventCourse[];
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

export function CourseList({ courses, onDelete, onEdit }: CourseListProps) {
  const t = useTranslations("dashboard.courses");

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t("table.title")}
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t("table.startDate")}
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t("table.endDate")}
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t("table.duration")}
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t("table.location")}
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">{t("table.actions")}</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {courses.map((course) => (
            <tr key={course.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <Text>{course.title}</Text>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Text>{format(course.startDate, "PPP")}</Text>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Text>{course.endDate ? format(course.endDate, "PPP") : "-"}</Text>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Text>{course.defaultDuration} min</Text>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Text>{course.location || "-"}</Text>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end gap-2">
                  <Button
                    bgColor="bg-transparent"
                    size="sm"
                    onClick={() => onEdit(course.id)}
                  >
                    <IconEdit size={20} />
                  </Button>
                  <Button
                    bgColor="bg-transparent"
                    size="sm"
                    onClick={() => onDelete(course.id)}
                  >
                    <IconTrash size={20} />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
