"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState, useMemo } from "react";
import { Course } from "@prisma/client";
import { useSession } from "next-auth/react";

import Button from "@/components/buttons/Button";
import { IconPlus } from "@tabler/icons-react";
import H1 from "@/components/typo/H1";
import { Text } from "@/components/typo/Text";
import { useOrganization } from "@/components/contexts/OrganizationContext";
import { getDashboardCourseUrl } from "@/utils/urls";
import { NAMESPACE_DASHBOARD_COURSES } from "@/res/namespaces";

import { CourseList } from "./components/course-list";
import SecondTimothy4_7 from "./components/SecondTimothy4_7";
import { CreateCourseDialog } from "./components/create-course-dialog";
import { userInOrganizationData } from "@/utils/permissions";
import { useNavigateWithProgress } from '@/hooks/useNavigateWithProgress';

export default function CoursesPage() {
  const t = useTranslations(NAMESPACE_DASHBOARD_COURSES);
  const { selectedOrganization } = useOrganization();
  const { data: session } = useSession();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { navigateWithProgress } = useNavigateWithProgress();

  useEffect(() => {
    if (!selectedOrganization) return;
    setIsLoading(true);
    const fetchCourses = async () => {
      try {
        const response = await fetch(
          `/api/courses?organizationId=${selectedOrganization.id}`
        );
        if (!response.ok) throw new Error("Failed to fetch courses");
        const data = await response.json();
        setCourses(data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [selectedOrganization]);

  const handleCreateCourse = async (course: Course) => {
    setCourses((prev) => [...prev, course]);
    setIsCreateDialogOpen(false);
  };

  const handleDeleteCourse = async (courseId: string, force?: boolean) => {
    try {
      const response = await fetch(`/api/courses/${courseId}${force ? '?force=true' : ''}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete course");
      }
      setCourses((prev) =>
        prev.filter((course) => course.id !== courseId)
      );
    } catch (error) {
      console.error("Error deleting course:", error);
      // You might want to show an error toast here
    }
  };

  const { hasCreatePermission, hasDeletePermission } = useMemo(() => 
    userInOrganizationData(session?.user?.id ?? '', selectedOrganization), 
    [session?.user?.id, selectedOrganization]
  );

  if (!selectedOrganization) {
    return (
      <div className="flex h-full items-center justify-center">
        <Text className="text-muted-foreground">{t("selectOrganization")}</Text>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <CoursesHeader setIsCreateDialogOpen={setIsCreateDialogOpen} hasCreatePermission={hasCreatePermission} className="mb-1" />

      <SecondTimothy4_7 className="mb-4" />

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Text className="text-muted-foreground">{t("loading")}</Text>
        </div>
      ) : courses.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed">
          <Text className="text-muted-foreground">{t("noCourses")}</Text>
          {hasCreatePermission && (
            <Button 
              onClick={() => setIsCreateDialogOpen(true)} 
              className="px-8 py-3 bg-primary hover:bg-primary/90 text-white font-medium shadow-sm hover:shadow-md transition-all"
            >
              {t("createFirstCourse")}
            </Button>
          )}
        </div>
      ) : (
        <CourseList
          courses={courses}
          hasDeletePermission={hasDeletePermission}
          onDelete={handleDeleteCourse}
          onEdit={(id) => navigateWithProgress(getDashboardCourseUrl(id))}
        />
      )}

      <CreateCourseDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateCourse}
        organizationId={selectedOrganization.id}
      />
    </div>
  );
}

interface IProps {
  setIsCreateDialogOpen: (open: boolean) => void;
  hasCreatePermission: boolean;
  className?: string;
}

const CoursesHeader = ({ setIsCreateDialogOpen, hasCreatePermission, className = "" }: IProps) => {
  const t = useTranslations(NAMESPACE_DASHBOARD_COURSES);
  return (
    <div className={`${className} flex items-center justify-between`}>
      <div>
        <H1>{t("title")}</H1>
        <Text className="text-muted-foreground">{t("description")}</Text>
      </div>
      {hasCreatePermission && (
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          paddingClass="px-3 py-2"
          className="flex items-center gap-2 border border-primary text-primary hover:bg-primary/10 transition-colors"
        >
          <IconPlus size={20} />
          {t("create")}
        </Button>
      )}
    </div>
  )
}
