"use client";

import { useTranslations } from "next-intl";
import { EventCourse } from "@prisma/client";
import Button from "@/components/buttons/Button";
import { useRouter } from "@/i18n/routing";
import { useState } from "react";
import { CourseDialog } from "./course-dialog";
import { IconEdit } from "@tabler/icons-react";
import H1 from "@/components/typo/H1";
import { Text } from "@/components/typo/Text";
import { format } from "date-fns";

interface EditCourseFormProps {
  course: EventCourse;
}

export function EditCourseForm({ course }: EditCourseFormProps) {
  const t = useTranslations("dashboard.courses");
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const onSubmit = async (updatedCourse: EventCourse) => {
    router.refresh();
    setIsDialogOpen(false);
    router.push("/dashboard/courses");
  };

  return (
    <div>
      <div className="mb-6">
        <H1>{course.title}</H1>
        <Text className="text-muted-foreground">
          {course.description || t("noDescription")}
        </Text>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <Text className="font-semibold">{t("fields.startDate")}:</Text>
            <Text>{format(new Date(course.startDate), "PPP")}</Text>
          </div>
          <div>
            <Text className="font-semibold">{t("fields.endDate")}:</Text>
            <Text>{course.endDate ? format(new Date(course.endDate), "PPP") : "-"}</Text>
          </div>
          <div>
            <Text className="font-semibold">{t("fields.defaultDuration")}:</Text>
            <Text>{course.defaultDuration} min</Text>
          </div>
          <div>
            <Text className="font-semibold">{t("fields.location")}:</Text>
            <Text>{course.location || "-"}</Text>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mt-6">
        <Button 
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <IconEdit size={20} />
          {t("edit")}
        </Button>
        <Button
          bgColor="bg-gray1"
          onClick={() => router.push("/dashboard/courses")}
        >
          {t("actions.cancel")}
        </Button>
      </div>

      <CourseDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={onSubmit}
        course={course}
        mode="edit"
      />
    </div>
  );
}
