"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/routing";
import { EventCourse } from "@prisma/client";
import { CreateCourseDialog } from "./components/create-course-dialog";
import Button from "@/components/buttons/Button";
import { IconPlus } from "@tabler/icons-react";
import H1 from "@/components/typo/H1";
import { Text } from "@/components/typo/Text";
import { useOrganization } from "@/components/contexts/OrganizationContext";
import { CourseList } from "./components/course-list";
import SecondTimothy4_7 from "./components/SecondTimothy4_7";
import { NAMESPACE_DASHBOARD_COURSES } from "@/res/namespaces";
import { getDashboardCourseUrl } from "@/utils/urls";

export default function CoursesPage() {
  const t = useTranslations(NAMESPACE_DASHBOARD_COURSES);
  const router = useRouter();
  const { selectedOrganization } = useOrganization();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [courses, setCourses] = useState<EventCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!selectedOrganization) return;

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

  const handleCreateCourse = async (course: EventCourse) => {
    setCourses((prev) => [...prev, course]);
    setIsCreateDialogOpen(false);
  };

  const handleDeleteCourses = async (courseId: string) => {
    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete course");
      setCourses((prev) =>
        prev.filter((course) => course.id !== courseId)
      );
    } catch (error) {
      console.error("Error deleting course:", error);
    }
  };

  if (!selectedOrganization) {
    return (
      <div className="flex h-full items-center justify-center">
        <Text className="text-muted-foreground">{t("selectOrganization")}</Text>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <CoursesHeader setIsCreateDialogOpen={setIsCreateDialogOpen} className="mb-1" />

      <SecondTimothy4_7 className="mb-4" />

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Text className="text-muted-foreground">{t("loading")}</Text>
        </div>
      ) : courses.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed">
          <Text className="text-muted-foreground">{t("noCourses")}</Text>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="px-6 py-2">
            {t("createFirstCourse")}
          </Button>
        </div>
      ) : (
        <CourseList
          courses={courses}
          onDelete={handleDeleteCourses}
          onEdit={(id) => router.push(getDashboardCourseUrl(id))}
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
  className?: string;
}

const CoursesHeader = ({ setIsCreateDialogOpen, className = "" }: IProps) => {
  const t = useTranslations(NAMESPACE_DASHBOARD_COURSES);
  return (
    <div className={`${className} flex items-center justify-between`}>
      <div>
        <H1>{t("title")}</H1>
        <Text className="text-muted-foreground">{t("description")}</Text>
      </div>
      <Button
        onClick={() => setIsCreateDialogOpen(true)}
        className="flex items-center gap-2"
      >
        <IconPlus size={20} />
        {t("create")}
      </Button>
    </div>
  )
}
