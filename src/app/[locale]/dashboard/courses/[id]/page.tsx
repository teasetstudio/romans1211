import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { ROUTE_DASHBOARD_COURSES } from "@/res/routes";
import { CourseDetails } from "../components/course-details";

interface EventCoursePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CoursePage({ params }: EventCoursePageProps) {
  const { id } = await params;
  const course = await prisma.eventCourse.findUnique({
    where: { id },
    include: {
      events: {
        orderBy: {
          startTime: 'asc'
        }
      }
    }
  });

  if (!course) {
    redirect(ROUTE_DASHBOARD_COURSES);
  }

  return (
    <div>
    {/* <div className="container mx-auto px-4 py-8"> */}
      <CourseDetails course={course} />
    </div>
  );
}
