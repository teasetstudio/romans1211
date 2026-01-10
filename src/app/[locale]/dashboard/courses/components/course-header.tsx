"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { Course } from "@prisma/client";
import Button from "@/components/buttons/Button";
import { IconEdit } from "@tabler/icons-react";
import { ProgressLink as Link } from '@/components/buttons/ProgressLink';
import { CourseDialog } from "./course-dialog";
import { NAMESPACE_DASHBOARD_COURSES } from "@/res/namespaces";
import { useOrganization } from "@/components/contexts/OrganizationContext";
import { useSession } from "next-auth/react";
import { userInOrganizationData } from "@/utils/permissions";
import { useNavigateWithProgress } from '@/hooks/useNavigateWithProgress';

interface CourseHeaderProps {
  course: Course;
  backTo: string;
}

const CourseHeader = ({ course, backTo }: CourseHeaderProps) => {
  const t = useTranslations(NAMESPACE_DASHBOARD_COURSES);
  const { refreshWithProgress } = useNavigateWithProgress();
  const { selectedOrganization } = useOrganization();
  const { data: session } = useSession();
  const [isEditCourseOpen, setIsEditCourseOpen] = useState(false);

  const handleCourseUpdate = async () => {
    refreshWithProgress();
    setIsEditCourseOpen(false);
  };

  const { hasEditPermission } = useMemo(() => 
    userInOrganizationData(session?.user?.id ?? '', selectedOrganization), 
    [session?.user?.id, selectedOrganization]
  );

  return (
    <>
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <Link 
                    href={backTo}
                    className="text-primary hover:text-primary/80"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                  </Link>
                  <h1 className="text-xl font-semibold text-gray-900 truncate">{course.title}</h1>
                </div>
                {course.description && (
                  <p className="mt-1 text-sm text-gray-600 line-clamp-1">{course.description}</p>
                )}
              </div>
              <div className="flex shrink-0 gap-2 self-start sm:self-center">
                {hasEditPermission && (
                  <Button
                    onClick={() => setIsEditCourseOpen(true)}
                    paddingClass="px-3 py-2"
                    className="inline-flex items-center text-gray-700 hover:text-primary  rounded-md transition-colors gap-1.5 text-sm border border-transparent hover:border-primary"
                >
                  <IconEdit className="w-4 h-4" />
                    <span>{t("edit")}</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <CourseDialog
        open={isEditCourseOpen}
        onOpenChange={setIsEditCourseOpen}
        onSubmit={handleCourseUpdate}
        course={course}
        mode="edit"
      />
    </>
  )
}

export default CourseHeader