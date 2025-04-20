"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Event } from "@prisma/client";
import Button from "@/components/buttons/Button";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { Text } from "@/components/typo/Text";
import { IconEdit, IconTrash } from "@/res/icons";
import EventFormDialog from "@/app/[locale]/dashboard/components/EventFormDialog";
import { useOrganization } from "@/components/contexts/OrganizationContext";
import { userInOrganizationData } from "@/utils/permissions";
import { Session } from "next-auth";

interface EventDetailsProps {
  event: Event;
  session: Session
}

export default function EventDetails({ event: initialEvent, session }: EventDetailsProps) {
  const t = useTranslations("dashboard_events");
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [event, setEvent] = useState(initialEvent);
  
  const { selectedOrganization } = useOrganization();

  if (!selectedOrganization) {
    return (
      <div className="flex h-full items-center justify-center">
        <Text className="text-muted-foreground">Select Organization</Text>
      </div>
    );
  }

  const { hasEditPermission, hasDeletePermission } = useMemo(() => 
    userInOrganizationData(session?.user?.id ?? '', selectedOrganization), 
    [session?.user?.id, selectedOrganization]
  );

  const handleSubmit = (updatedEvent: Event) => {
    setEvent(updatedEvent);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!confirm(t("confirm_delete"))) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/events/${event.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete event");
      }

      toast.success(t("deleted"));
      router.push(`/dashboard/courses/${event.courseId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <Link 
                    href={`/dashboard/courses/${event.courseId}`}
                    className="text-primary hover:text-primary/80"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                  </Link>
                  <h1 className="text-xl font-semibold text-gray-900 truncate">{event.title}</h1>
                  {event.isCancelled && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Cancelled
                    </span>
                  )}
                </div>
                {event.description && (
                  <p className="mt-1 text-sm text-gray-600 line-clamp-1">{event.description}</p>
                )}
                <div className="mt-1 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(event.startTime).toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {new Date(event.endTime).toLocaleString()}
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {event.location}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 gap-2 self-start sm:self-center">
                {hasEditPermission &&
                  <Button
                    onClick={() => setIsEditing(true)}
                    paddingClass="py-3 px-4"
                    className="inline-flex items-center text-gray-700 hover:text-primary rounded-md transition-colors gap-1.5 text-sm border border-transparent hover:border-primary"
                  >
                    <IconEdit className="w-4 h-4" />
                    <span>{t("edit")}</span>
                  </Button>
                }
                {hasDeletePermission &&
                  <Button
                    onClick={handleDelete}
                    paddingClass="py-3 px-4"
                    className="inline-flex items-center text-gray-700 hover:text-red-600 rounded-md transition-colors gap-1.5 text-sm border border-transparent hover:border-red-600"
                    disabled={isDeleting}
                  >
                    <IconTrash className="w-4 h-4" />
                    <span>{isDeleting ? t("deleting") : t("delete")}</span>
                  </Button>
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      <EventFormDialog
        mode="edit"
        open={isEditing}
        onClose={() => setIsEditing(false)}
        onSubmit={handleSubmit}
        event={event}
      />
    </>
  );
}
