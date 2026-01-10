"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { Event, Course } from "@prisma/client";
import Button from "@/components/buttons/Button";
import { IconPlus, IconInfoSquare } from "@tabler/icons-react";
import { Text } from "@/components/typo/Text";
import { ROUTE_DASHBOARD_COURSES, ROUTE_DASHBOARD_EVENT } from "@/res/routes";
import { EventList } from "./event-list";
import { CourseDialog } from "./course-dialog";
import CourseHeader from "./course-header";
import { NAMESPACE_DASHBOARD_COURSES } from "@/res/namespaces";
import EventFormDialog from "../../components/EventFormDialog";
import { useOrganization } from "@/components/contexts/OrganizationContext";
import { useSession } from "next-auth/react";
import { userInOrganizationData } from "@/utils/permissions";
import { useNavigateWithProgress } from '@/hooks/useNavigateWithProgress';
import { ROUTE_DASHBOARD_COURSES_INFO } from "@/res/routes";

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

  const { hasCreatePermission } = useMemo(() => 
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
      <CourseHeader course={course} backTo={ROUTE_DASHBOARD_COURSES} />

      {/* Container */}
      <div className="mt-2 max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        {/* Info / Additional Buttons */}
        <div className="flex items-center justify-between mb-4">
          <Button 
            onClick={() => navigateWithProgress(ROUTE_DASHBOARD_COURSES_INFO(course.id))}
            rounded="rounded-md"
            paddingClass="px-2 py-1"
            className="inline-flex items-center text-gray-400 hover:text-primary transition-colors gap-1.5 text-sm border border-transparent hover:border-primary"
          >
            <IconInfoSquare size={20} strokeWidth={2.5} />
              {t("info")}
          </Button>

          {hasCreatePermission && (
            <Button
              onClick={() => setIsCreateEventOpen(true)}
              rounded="rounded-md"
              paddingClass="px-2 py-1"
              className="inline-flex items-center text-gray-400 hover:text-primary transition-colors gap-1.5 text-sm border border-transparent hover:border-primary"
            >
              <IconPlus className="w-4 h-4" />
                {t("createEvent")}
            </Button>
          )}
        </div>

        {/* Events */}
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
