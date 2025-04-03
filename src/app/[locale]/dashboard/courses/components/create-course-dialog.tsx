"use client"

import { Course } from "@prisma/client";
import { CourseDialog } from "./course-dialog";

interface CreateCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (course: Course) => void;
  organizationId: string;
}

export function CreateCourseDialog({
  open,
  onOpenChange,
  onSubmit,
  organizationId,
}: CreateCourseDialogProps) {
  return (
    <CourseDialog
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={onSubmit}
      organizationId={organizationId}
      mode="create"
    />
  );
}
