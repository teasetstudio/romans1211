"use client"

import { useTranslations } from "next-intl";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { EventCourse } from "@prisma/client";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import Input from "@/components/inputs/Input";
import NumberInput from "@/components/inputs/NumberInput";
import Button from "@/components/buttons/Button";
import { DatePicker } from "@/components/inputs/DatePicker";
import { NAMESPACE_DASHBOARD_COURSES } from "@/res/namespaces";

const courseSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  location: z.string().optional(),
  startDate: z.date(),
  endDate: z.date().optional().nullable(),
  defaultDuration: z.number().min(1).max(1440), // Max 24 hours in minutes
});

type CourseFormData = z.infer<typeof courseSchema>;

interface CourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (course: EventCourse) => void;
  organizationId?: string;
  course?: EventCourse;
  mode: 'create' | 'edit';
}

export function CourseDialog({
  open,
  onOpenChange,
  onSubmit,
  organizationId,
  course,
  mode,
}: CourseDialogProps) {
  const t = useTranslations(`${NAMESPACE_DASHBOARD_COURSES}.courseDialog`);
  const methods = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: mode === 'edit' && course ? {
      title: course.title,
      description: course.description || "",
      location: course.location || "",
      startDate: new Date(course.startDate),
      endDate: course.endDate ? new Date(course.endDate) : null,
      defaultDuration: course.defaultDuration,
    } : {
      title: "",
      description: "",
      location: "",
      startDate: new Date(),
      endDate: null,
      defaultDuration: 60,
    },
  });

  const handleSubmit = async (data: CourseFormData) => {
    try {
      const url = mode === 'create' 
        ? "/api/courses" 
        : `/api/courses/${course?.id}`;
      
      const method = mode === 'create' ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          ...(mode === 'create' && { organizationId }),
          startDate: data.startDate.toISOString(),
          endDate: data.endDate?.toISOString() || null,
        }),
      });

      if (!response.ok) throw new Error(`Failed to ${mode} course`);

      const result = await response.json();
      onSubmit(result);
      if (mode === 'create') {
        methods.reset();
      }
    } catch (error) {
      console.error(`Error ${mode}ing course:`, error);
    }
  };

  const startDate = methods.watch("startDate");
  const endDate = methods.watch("endDate");

  return (
    <Dialog open={open} onClose={() => onOpenChange(false)} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="mx-auto w-full max-w-2xl rounded-xl bg-white p-8 shadow-xl">
          <DialogTitle className="text-2xl font-semibold leading-7 text-gray-900 mb-6">
            {t(mode === 'create' ? 'createTitle' : 'editTitle')}
          </DialogTitle>

          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(handleSubmit)} className="space-y-6">
              <Input
                name="title"
                placeholder={t("fields.title")}
              />

              <Input
                name="description"
                placeholder={t("fields.description")}
              />

              <Input
                name="location"
                placeholder={t("fields.location")}
              />

              <DatePicker
                label={t("fields.startDate")}
                selected={startDate}
                onChange={(date) => date && methods.setValue("startDate", date)}
              />

              <DatePicker
                label={t("fields.endDate")}
                selected={endDate || null}
                onChange={(date) => methods.setValue("endDate", date)}
                isClearable
              />

              <NumberInput
                name="defaultDuration"
                placeholder={t("fields.defaultDuration")}
                min={1}
                max={1440}
              />

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  onClick={() => onOpenChange(false)}
                  paddingClass="px-6 py-2.5"
                >
                  {t("cancel")}
                </Button>
                <Button 
                  type="submit"
                  paddingClass="px-6 py-2.5"
                  className="bg-primary hover:bg-primary/90 text-white font-medium"
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