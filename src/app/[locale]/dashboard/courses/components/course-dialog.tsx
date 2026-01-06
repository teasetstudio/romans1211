"use client"

import { useTranslations } from "next-intl";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Course } from "@prisma/client";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { IconCaretUpFilled, IconCaretDownFilled } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import Input from "@/components/inputs/Input";
import Button from "@/components/buttons/Button";
// import { DatePicker } from "@/components/inputs/DatePicker";
import { NAMESPACE_DASHBOARD_COURSES } from "@/res/namespaces";
import DefaultItemModal from "./DefaultItemModal";

const courseSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  // location: z.string().optional(),
  // startDate: z.date().optional().nullable(),
  // endDate: z.date().optional().nullable(),
});

type CourseFormData = z.infer<typeof courseSchema>;

interface CourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (course: Course) => void;
  organizationId?: string;
  course?: Course;
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
  const [planItems, setPlanItems] = useState<any[]>([]);
  const [loadingDefaultPlanItems, setLoadingDefaultPlanItems] = useState(false);
  const [changingPlanItemOrder, setChangingPlanItemOrder] = useState(false);
  const [changingPlanItemOrderId, setChangingPlanItemOrderId] = useState<string | null>(null);
  const [isPlanItemModalOpen, setIsPlanItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  const methods = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: mode === 'edit' && course ? {
      title: course.title,
      description: course.description || "",
      // location: course.location || "",
      // startDate: course.startDate ? new Date(course.startDate) : null,
      // endDate: course.endDate ? new Date(course.endDate) : null,
    } : {
      title: "",
      description: "",
      // location: "",
      // startDate: new Date(),
      // endDate: null,
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
          // startDate: data.startDate?.toISOString() || null,
          // endDate: data.endDate?.toISOString() || null,
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

  const handleEditPlanItem = (item: any) => {
    setEditingItem(item);
    setIsPlanItemModalOpen(true);
  };

  const handleMovePlanItem = async (itemId: string, direction: 'up' | 'down') => {
    if (!course) return;
    try {
      setChangingPlanItemOrder(true);
      setChangingPlanItemOrderId(itemId);
      const response = await fetch(
        `/api/courses/${course.id}/default-event-plan-items/change-order`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ itemId, direction }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to change order');
      }

      const result = await response.json();
      const items = Array.isArray(result) ? result : result.items;
      if (Array.isArray(items)) {
        setPlanItems(items);
      }
    } catch (error) {
      console.error('Error changing plan item order:', error);
    } finally {
      setChangingPlanItemOrder(false);
      setChangingPlanItemOrderId(null);
    }
  };

  const handleSavePlanItem = async (item: any) => {
    if (!course) return;

    try {
      const isEditing = !!editingItem;
      const url = isEditing
        ? `/api/courses/${course.id}/default-event-plan-items/${editingItem.id}`
        : `/api/courses/${course.id}/default-event-plan-items`;
      const method = isEditing ? 'PUT' : 'POST';
      if (!isEditing) {
        item.type = "CUSTOM";
        const highestOrder = planItems.reduce(
          (max: number, prep: { order: number }) => Math.max(max, prep.order),
          0
        );
        item.order = highestOrder + 1;
      }
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      });
      if (!response.ok) {
        throw new Error('Failed to save plan item');
      }
      const result = await response.json();
      const savedItem = Array.isArray(result) ? result[0] : result;
      if (isEditing) {
        // Update existing item
        setPlanItems(prev => 
          prev.map(p => p.id === savedItem.id ? savedItem : p)
        );
      } else {
        // Add new item
        setPlanItems(prev => [...prev, savedItem]);
      }
      setIsPlanItemModalOpen(false);
      setEditingItem(null);
      // toast.success(`Plan item ${item.id ? 'updated' : 'created'} successfully`);
    } catch (error) {
      console.error('Error saving plan item:', error);
      // toast.error(`Failed to ${item.id ? 'update' : 'create'} plan item`);
    }
  };

  const handleDeletePlanItem = async (itemId: string) => {
    if (!course) return;
    try {
      const response = await fetch(`/api/courses/${course.id}/default-event-plan-items/${itemId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete plan item');
      }
      setPlanItems(prev => prev.filter(item => item.id !== itemId));
      setIsPlanItemModalOpen(false);
      setEditingItem(null);
      // toast.success('Plan item deleted successfully');
    } catch (error) {
      console.error('Error deleting plan item:', error);
      // toast.error('Failed to delete plan item');
    }
  };

  // const startDate = methods.watch("startDate");
  // const endDate = methods.watch("endDate");

  useEffect(() => {
    const fetchDefaultPlanItems = async () => {
      if (!course?.id || !open) return;
      
      try {
        setLoadingDefaultPlanItems(true);
        const response = await fetch(`/api/courses/${course.id}/default-event-plan-items`);
        if (!response.ok) {
          throw new Error('Failed to fetch default plan items');
        }
        const defaultItems = await response.json();
        setPlanItems(defaultItems);
      } catch (error) {
        console.error('Error fetching default plan items:', error);
        // toast.error('Failed to load default plan items');
      } finally {
        setLoadingDefaultPlanItems(false);
      }
    };

    fetchDefaultPlanItems();
  }, [course?.id, open]);

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
{/* 
              <Input
                name="location"
                placeholder={t("fields.location")}
              />

              <DatePicker
                label={t("fields.startDate")}
                selected={startDate || null}
                onChange={(date) => date && methods.setValue("startDate", date)}
              />

              <DatePicker
                label={t("fields.endDate")}
                selected={endDate || null}
                onChange={(date) => methods.setValue("endDate", date)}
                isClearable
              /> */}

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

          {course && mode ==='edit' &&
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Default Plan Items</h3>

              {loadingDefaultPlanItems ? (
                <div className="flex justify-center items-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  <span className="ml-3 text-gray-600">Loading plan items...</span>
                </div>
              ) :
                <>
                  {planItems.length > 0 ? (
                    <div className="space-y-2">
                      {planItems
                        .slice()
                        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                        .map((item, idx, arr) => (
                        <div 
                          key={item.id} 
                          className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                        >
                          <div>
                            <p className="font-medium">{item.title}</p>
                          </div>
                            <div className="flex items-center gap-2">
                              {planItems.length > 1 &&
                                <div>
                                  {changingPlanItemOrder && changingPlanItemOrderId === item.id ? (
                                    <span className="text-sm text-gray-500">Moving...</span>
                                  ) : (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => handleMovePlanItem(item.id, 'up')}
                                        disabled={changingPlanItemOrder || idx === 0}
                                        className="text-sm text-gray-700 hover:text-gray-900 disabled:opacity-40"
                                      >
                                        <IconCaretUpFilled />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleMovePlanItem(item.id, 'down')}
                                        disabled={changingPlanItemOrder || idx === arr.length - 1}
                                        className="text-sm text-gray-700 hover:text-gray-900 disabled:opacity-40"
                                      >
                                        <IconCaretDownFilled />
                                      </button>
                                    </>
                                  )}
                                </div>
                              }
                              <button
                                type="button"
                                onClick={() => handleEditPlanItem(item)}
                                disabled={changingPlanItemOrder}
                                className="text-sm text-primary hover:text-primary/80 disabled:opacity-40"
                              >
                                Edit
                              </button>
                            </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No plan items added yet.</p>
                  )}
                </>
              }
              <div className="flex justify-end mt-4">
                {!loadingDefaultPlanItems &&
                  <button
                    type="button"
                    onClick={() => {
                      setEditingItem(null);
                      setIsPlanItemModalOpen(true);
                    }}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    + Add Plan Item
                  </button>
                }
              </div>
            </div>
          }

          {/* Plan Item Modal */}
          {course && isPlanItemModalOpen && (
            <DefaultItemModal
              isOpen={isPlanItemModalOpen}
              onClose={() => {
                setIsPlanItemModalOpen(false);
                setEditingItem(null);
              }}
              onSave={handleSavePlanItem}
              onDelete={handleDeletePlanItem}
              editingItem={editingItem || undefined}
              isEditing={!!editingItem}
            />
          )}
        </DialogPanel>
      </div>
    </Dialog>
  );
} 