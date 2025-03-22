"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Event, EventCourse } from "@prisma/client";
import Button from "@/components/buttons/Button";
import { IconPlus, IconArrowLeft, IconEdit } from "@tabler/icons-react";
import H1 from "@/components/typo/H1";
import { Text } from "@/components/typo/Text";
import { format } from "date-fns";
import Link from "next/link";
import { ROUTE_DASHBOARD_COURSES, ROUTE_DASHBOARD_EVENT } from "@/res/routes";
import { EventList } from "./event-list";
import { CourseDialog } from "./course-dialog";
import { useRouter } from "@/i18n/routing";
import { NAMESPACE_DASHBOARD_COURSES } from "@/res/namespaces";
import EventFormDialog from "../../components/EventFormDialog";

interface CourseDetailsProps {
  course: EventCourse & {
    events: Event[];
  };
}

export function CourseDetails({ course }: CourseDetailsProps) {
  const t = useTranslations(NAMESPACE_DASHBOARD_COURSES);
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>(course.events);
  const [isEditCourseOpen, setIsEditCourseOpen] = useState(false);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);

  const handleCourseUpdate = async (updatedCourse: EventCourse) => {
    router.refresh();
    setIsEditCourseOpen(false);
  };

  const handleCreateEvent = async (event: Event) => {
    setEvents((prev) => [...prev, event]);
    setIsCreateEventOpen(false);
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete event");
      setEvents((prev) => prev.filter((event) => event.id !== eventId));
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Link href={ROUTE_DASHBOARD_COURSES} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4">
          <IconArrowLeft size={16} />
          <span>{t("backToCourses")}</span>
        </Link>
        
        <div className="flex items-center justify-between">
          <div>
            <H1>{course.title}</H1>
            <Text className="text-muted-foreground">
              {course.description || t("noDescription")}
            </Text>
            <div className="mt-2 flex gap-4">
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
          <div className="flex gap-2">
            <Button
              onClick={() => setIsEditCourseOpen(true)}
              className="flex items-center gap-2"
            >
              <IconEdit size={20} />
              {t("edit")}
            </Button>
            <Button
              onClick={() => setIsCreateEventOpen(true)}
              className="flex items-center gap-2"
            >
              <IconPlus size={20} />
              {t("createEvent")}
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{t("events")}</h2>
        </div>
        
        {events.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed">
            <Text className="text-muted-foreground">{t("noEvents")}</Text>
            <Button onClick={() => setIsCreateEventOpen(true)} className="px-6 py-2">
              {t("createFirstEvent")}
            </Button>
          </div>
        ) : (
          <>
            <EventList
              events={events} 
              onDelete={handleDeleteEvent}
              onEdit={(id) => router.push(ROUTE_DASHBOARD_EVENT(id))}
            />
            <div className="mt-4 flex justify-end">
              <Button
                onClick={() => setIsCreateEventOpen(true)}
                className="flex items-center gap-2"
              >
                <IconPlus size={20} />
                {t("createEvent")}
              </Button>
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
