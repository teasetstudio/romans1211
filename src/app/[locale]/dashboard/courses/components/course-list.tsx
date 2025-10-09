"use client"

import { Course } from "@prisma/client";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { IconTrash } from "@tabler/icons-react";
import Button from "@/components/buttons/Button";
import { Text } from "@/components/typo/Text";
import { NAMESPACE_DASHBOARD_COURSES } from "@/res/namespaces";
import { useState } from "react";
import { toast } from "react-hot-toast";
import DeleteConfirmationPopup from "@/components/popups/DeleteConfirmationPopup";

interface CourseListProps {
  courses: Course[];
  onDelete: (id: string, force?: boolean) => void;
  onEdit: (id: string) => void;
  hasDeletePermission: boolean;
}

export function CourseList({ courses, onDelete, onEdit, hasDeletePermission }: CourseListProps) {
  const t = useTranslations(NAMESPACE_DASHBOARD_COURSES);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasEvents, setHasEvents] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent, courseId: string) => {
    e.stopPropagation();
    setCourseToDelete(courseId);
  };

  const handleConfirmDelete = async () => {
    if (courseToDelete) {
      try {
        setIsDeleting(true);
        // First check if course has events
        const response = await fetch(`/api/courses/${courseToDelete}`);
        const course = await response.json();
        
        if (course.events?.length > 0) {
          setHasEvents(true);
          setIsDeleting(false);
          toast.error(t("cannotDeleteCourseWithEvents"))
          return;
        }

        if (!isDeleting) {
          setIsDeleting(true);
        }
        await onDelete(courseToDelete);
      } catch (error) {
        console.error("Error in handleConfirmDelete:", error);
      } finally {
        setIsDeleting(false);
        setCourseToDelete(null);
      }
    }
  };

  const handleForceDelete = async () => {
    if (courseToDelete) {
      try {
        setIsDeleting(true);
        await onDelete(courseToDelete, true);
      } finally {
        setIsDeleting(false);
        setCourseToDelete(null);
        setHasEvents(false);
      }
    }
  };

  const handleCancelDelete = () => {
    setCourseToDelete(null);
    setIsDeleting(false);
    setHasEvents(false);
  };

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("table.title")}
              </th>
              {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("table.startDate")}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("table.endDate")}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("table.location")}
              </th> */}
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">{t("table.actions")}</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {courses.map((course) => (
              <tr 
                key={course.id} 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => onEdit(course.id)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <Text>{course.title}</Text>
                </td>
                {/* <td className="px-6 py-4 whitespace-nowrap">
                  <Text>{format(course.startDate, "PPP")}</Text>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Text>{course.endDate ? format(course.endDate, "PPP") : "-"}</Text>
                </td> */}
                {/* <td className="px-6 py-4 whitespace-nowrap">
                  <Text>{course.location || "-"}</Text>
                </td> */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-center min-h-9">
                    {hasDeletePermission && (
                      <Button
                        bgColor="bg-transparent"
                        size="sm"
                        className="text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full w-10 h-10 flex items-center justify-center transition-all !min-w-0"
                        onClick={(e) => handleDeleteClick(e, course.id)}
                      >
                        <IconTrash size={20} />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DeleteConfirmationPopup
        isOpen={!!courseToDelete}
        onClose={handleCancelDelete}
        onConfirm={hasEvents ? handleForceDelete : handleConfirmDelete}
        confirmText={hasEvents ? t("deleteConfirmationWithEvents") : t("deleteConfirmation")}
        isDeleting={isDeleting}
      />
    </>
  );
}
