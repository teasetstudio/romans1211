import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { ROUTE_DASHBOARD_COURSES } from "@/res/routes";

import { EditCourseForm } from "../../components/edit-course-form";

interface CoursePageProps {
  params: Promise<{
    id: string;
    locale: string;
  }>;
}

export default async function CourseEditPage({ params }: CoursePageProps) {
  const { id } = await params;
  const course = await prisma.eventCourse.findUnique({
    where: { id },
  });

  if (!course) {
    redirect(ROUTE_DASHBOARD_COURSES);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Course</h1>
      <EditCourseForm course={course} />
    </div>
  );
}
