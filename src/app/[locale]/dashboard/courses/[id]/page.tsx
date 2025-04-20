import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { ROUTE_DASHBOARD_COURSES } from "@/res/routes";
import { CourseDetails } from "../components/course-details";
import { getSession } from "@/lib/auth";
import { userInOrganizationData } from "@/utils/permissions";
import { Organization } from "@/components/contexts/OrganizationContext";
import { ORG_READ_PERMISSIONS } from "@/lib/permissions";

interface EventCoursePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CoursePage({ params }: EventCoursePageProps) {
  const { id } = await params;
  const session = await getSession();
  const course = await prisma.course.findUnique({
    where: {
      id,
      organization: {
        members: {
          some: {
            userId: session?.user?.id ?? '',
            permissions: {
              hasSome: ORG_READ_PERMISSIONS
            }
          }
        }
      }
    },
    include: {
      events: {
        orderBy: {
          startTime: 'asc'
        }
      },
      organization: {
        include: {
          members: {
            where: {
              userId: session?.user?.id ?? ''
            },
          }
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
