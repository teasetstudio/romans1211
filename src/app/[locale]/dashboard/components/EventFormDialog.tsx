"use client";

import { useTranslations } from "next-intl";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Event, Course } from "@prisma/client";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Input from "@/components/inputs/Input";
import Button from "@/components/buttons/Button";
import { DateTimePicker } from "@/components/inputs/DateTimePicker";
import { IconClose } from "@/res/icons";
import { addMinutes } from "date-fns";
import { predictNextEventTimes } from "@/utils/dates";

const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  startTime: z.date(),
  endTime: z.date(),
  isCancelled: z.boolean().default(false),
});

export type EventFormData = z.infer<typeof eventSchema>;

interface EventFormDialogProps {
  mode: 'create' | 'edit';
  open: boolean;
  onClose: () => void;
  onSubmit?: (response: Event) => void;
  // For create mode
  course?: Course;
  // For edit mode
  event?: Event;
}

export default function EventFormDialog({
  mode,
  open,
  onClose,
  onSubmit,
  course,
  event
}: EventFormDialogProps) {
  const t = useTranslations("dashboard_events.createEventDialog");
  const router = useRouter();

  // Calculate initial form values based on mode
  const getDefaultValues = () => {
    if (mode === 'edit' && event) {
      return {
        title: event.title,
        description: event.description || "",
        location: event.location || "",
        startTime: new Date(event.startTime),
        endTime: new Date(event.endTime),
        isCancelled: event.isCancelled,
      };
    }

    // @ts-ignore - `events` is included on `course` from the page's data loader
    const eventsForCourse: Array<{ startTime: Date | string; endTime: Date | string; title?: string; description?: string }> | undefined = course?.events;
    // @ts-ignore
    const lastEvent: Event | undefined = eventsForCourse?.[0];

    // Create mode
    const prediction = predictNextEventTimes(
      eventsForCourse,
      course ? new Date(course.startDate) : undefined
    );

    const startTime = prediction?.startTime
      || (lastEvent ? new Date(lastEvent.startTime) : course ? new Date(course.startDate) : new Date());
    const endTime = prediction?.endTime || addMinutes(startTime, 60); // 1 hour default if no course

    return {
      title: lastEvent?.title || course?.title || "",
      description: lastEvent?.description || course?.description || "",
      location: course?.location || "",
      startTime,
      endTime,
      isCancelled: false,
    };
  };

  const methods = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: getDefaultValues(),
  });

  const startTime = methods.watch("startTime");

  // Helper function to update end time when start time changes.
  // Uses the previous start time to preserve duration when shifting the start.
  const updateEndTime = (newStartTime: Date, prevStartTime: Date) => {
    const currentEndTime = methods.getValues("endTime");
    if (!currentEndTime || !prevStartTime) return;
    const currentDuration = currentEndTime.getTime() - prevStartTime.getTime();
    const newEndTime = new Date(newStartTime.getTime() + Math.max(0, currentDuration));
    methods.setValue("endTime", newEndTime, { shouldDirty: true, shouldValidate: true });
  };

  const handleSubmit = async (data: EventFormData) => {
    try {
      let response;

      if (mode === 'create' && course) {
        // Create new event
        response = await fetch("/api/events", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...data,
            courseId: course.id,
            organizationId: course.organizationId,
            startTime: data.startTime.toISOString(),
            endTime: data.endTime.toISOString(),
          }),
        });
      } else if (mode === 'edit' && event) {
        // Update existing event
        response = await fetch(`/api/events/${event.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...data,
            startTime: data.startTime.toISOString(),
            endTime: data.endTime.toISOString(),
          }),
        });
      } else {
        throw new Error("Invalid mode or missing required props");
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${mode} event`);
      }

      const responseData = await response.json();
      toast.success(t(mode === 'create' ? "created" : "updated"));
      onSubmit?.(responseData);
      onClose();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-lg transform overflow-hidden rounded-lg bg-white p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4 border-b pb-3">
            <DialogTitle className="text-lg font-medium text-gray-900">
              {mode === 'create' ? t("create_event") : t("edit_event")}
            </DialogTitle>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <IconClose className="h-5 w-5" />
            </button>
          </div>

          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(handleSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("fields.title")}
                </label>
                <Input
                  name="title"
                  placeholder={t("fields.title")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("fields.description")}
                </label>
                <Input
                  name="description"
                  placeholder={t("fields.description")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("fields.location")}
                </label>
                <Input
                  name="location"
                  placeholder={t("fields.location")}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DateTimePicker
                  label={t("fields.startTime")}
                  selected={startTime}
                  onChange={(date) => {
                    if (date) {
                      const prevStart = methods.getValues("startTime");
                      methods.setValue("startTime", date, { shouldDirty: true, shouldValidate: true });
                      updateEndTime(date, prevStart);
                    }
                  }}
                />

                <DateTimePicker
                  label={t("fields.endTime")}
                  selected={methods.watch("endTime")}
                  onChange={(date) => date && methods.setValue("endTime", date)}
                  minDate={startTime}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                <Button
                  onClick={onClose}
                  className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  type="button"
                >
                  {t("cancel")}
                </Button>
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-colors"
                >
                  {mode === 'create' ? t("create") : t("save")}
                </Button>
              </div>
            </form>
          </FormProvider>
        </DialogPanel>
      </div>
    </Dialog>
  );
} 