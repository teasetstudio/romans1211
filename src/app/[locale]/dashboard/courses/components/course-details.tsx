"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { Event, Course } from "@prisma/client";
import Button from "@/components/buttons/Button";
import { IconPlus, IconCalendar, IconEdit, IconMapPin } from "@tabler/icons-react";
import { Text } from "@/components/typo/Text";
import { ProgressLink as Link } from '@/components/buttons/ProgressLink';
import { ROUTE_DASHBOARD_COURSES, ROUTE_DASHBOARD_EVENT } from "@/res/routes";
import { EventList } from "./event-list";
import { CourseDialog } from "./course-dialog";
import { NAMESPACE_DASHBOARD_COURSES } from "@/res/namespaces";
import EventFormDialog from "../../components/EventFormDialog";
import { useOrganization } from "@/components/contexts/OrganizationContext";
import { useSession } from "next-auth/react";
import { userInOrganizationData } from "@/utils/permissions";
import { useNavigateWithProgress } from '@/hooks/useNavigateWithProgress';

interface CourseDetailsProps {
  course: Course & {
    events: Event[];
  };
}

export function CourseDetails({ course }: CourseDetailsProps) {
  const t = useTranslations(NAMESPACE_DASHBOARD_COURSES);
  const { navigateWithProgress, refreshWithProgress } = useNavigateWithProgress();
  const { selectedOrganization } = useOrganization();
  const { data: session } = useSession();
  const [events, setEvents] = useState<Event[]>(course.events);
  const [isEditCourseOpen, setIsEditCourseOpen] = useState(false);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);

  const handleCourseUpdate = async () => {
    refreshWithProgress();
    setIsEditCourseOpen(false);
  };

  const handleCreateEvent = async (event: Event) => {
    setEvents((prev) =>
      [event, ...prev].sort(
        (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      )
    );
    setIsCreateEventOpen(false);
  };

  const { hasCreatePermission, hasEditPermission } = useMemo(() => 
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
    <div>
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <Link 
                    href={ROUTE_DASHBOARD_COURSES}
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
                <div className="mt-1 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <IconCalendar className="w-4 h-4" />
                    {new Date(course.startDate).toLocaleString()}
                  </div>
                  {course.endDate &&
                    <div className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {new Date(course.endDate).toLocaleString()}
                    </div>
                  }
                  {course.location && (
                    <div className="flex items-center gap-1">
                      <IconMapPin className="w-4 h-4" />
                      {course.location}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 gap-2 self-start sm:self-center">
                {hasCreatePermission && (
                  <Button
                    onClick={() => setIsCreateEventOpen(true)}
                    paddingClass="px-3 py-2"
                  className="inline-flex items-center text-gray-700 hover:text-primary rounded-md transition-colors gap-1.5 text-sm border border-transparent hover:border-primary"
                >
                  <IconPlus className="w-4 h-4" />
                    {t("createEvent")}
                  </Button>
                )}
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

      <div className="mt-8 max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{t("events")}</h2>
        </div>
        
        {events.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed">
            <Text className="text-muted-foreground">{t("noEvents")}</Text>
            {hasCreatePermission && (
              <Button 
                onClick={() => setIsCreateEventOpen(true)}
              className="px-8 py-3 text-base font-semibold flex items-center gap-2 bg-primary text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              <IconPlus size={20} strokeWidth={2.5} />
                {t("createFirstEvent")}
              </Button>
            )}
          </div>
        ) : (
          <>
            <EventList
              events={events}
              onEdit={(id) => navigateWithProgress(ROUTE_DASHBOARD_EVENT(id))}
            />
            <div className="mt-4 flex justify-end">
              {hasCreatePermission && (
                <Button
                  onClick={() => setIsCreateEventOpen(true)}
                  paddingClass="py-3 px-4"
                  className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg shadow-sm"
              >
                <IconPlus size={20} />
                  {t("createEvent")}
                </Button>
              )}
            </div>
          </>
        )}
      </div>

      <CourseDialog
        open={isEditCourseOpen}
        onOpenChange={setIsEditCourseOpen}
        onSubmit={handleCourseUpdate}
        course={course}
        mode="edit"
      />

      <EventFormDialog
        mode="create"
        open={isCreateEventOpen}
        onClose={() => setIsCreateEventOpen(false)}
        onSubmit={handleCreateEvent}
        course={course}
      />
    </div>
  );
}
