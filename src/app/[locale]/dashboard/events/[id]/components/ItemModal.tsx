"use client"

import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import TextEditor from "@/components/inputs/TextEditor";
import { useState, useEffect } from "react";
import { IconTrash, IconPlus, IconGripVertical, IconCheck } from "@tabler/icons-react";
import { IPlanItem } from "@/types/PlanItem";

// Local interface for form state (simpler version)
interface IPreparationForm {
  id: string;
  title: string;
  order: number;
  isCompleted?: boolean;
  completedAt?: Date;
  completedBy?: string;
}

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Partial<IPlanItem>) => void;
  editingItem?: IPlanItem | null;
}

const ItemModal = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
}: ItemModalProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isReserve, setIsReserve] = useState(false);
  const [preparations, setPreparations] = useState<IPreparationForm[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Reset form or populate with editing item when modal opens/changes
  useEffect(() => {
    if (isOpen && editingItem) {
      setTitle(editingItem.title);
      setDescription(editingItem.description || "");
      setIsReserve(editingItem.isReserve || false);
      // Convert IPreparation[] to IPreparationForm[] for editing
      const formPreparations = (editingItem.preparations || []).map(prep => ({
        id: prep.id,
        title: prep.title,
        order: prep.order,
        isCompleted: prep.isCompleted,
        completedAt: prep.completedAt || undefined,
        completedBy: prep.completedBy || undefined
      }));
      setPreparations(formPreparations);
      setShowDeleteConfirm(false);
    } else if (isOpen) {
      setTitle("");
      setDescription("");
      setIsReserve(false);
      setPreparations([]);
      setShowDeleteConfirm(false);
    }
  }, [isOpen, editingItem]);

  const handleSubmit = () => {
    if (!title.trim()) return;

    onSave({
      title,
      description,
      isReserve,
      // Convert IPreparationForm[] back to IPreparation[] format
      preparations: preparations.map(prep => ({
        ...prep,
        isCompleted: prep.isCompleted || false,
        completedAt: prep.completedAt || null,
        completedBy: prep.completedBy || null,
        eventPlanItemId: '', // Will be set by the backend
        createdAt: new Date(), // Will be set by the backend
        updatedAt: new Date()  // Will be set by the backend
      })),
    });

    // Reset form
    setTitle("");
    setDescription("");
    setIsReserve(false);
    setPreparations([]);
  };

  // Preparation management functions
  const addPreparation = () => {
    const newPrep: IPreparationForm = {
      id: `temp-${Date.now()}`, // Temporary ID for new items
      title: "",
      order: preparations.length,
      isCompleted: false,
    };
    setPreparations(prev => [...prev, newPrep]);
  };

  const updatePreparation = (id: string, updates: Partial<IPreparationForm>) => {
    setPreparations(prev => prev.map(prep => 
      prep.id === id ? { ...prep, ...updates } : prep
    ));
  };

  const deletePreparation = (id: string) => {
    setPreparations(prev => {
      const filtered = prev.filter(prep => prep.id !== id);
      // Reorder remaining preparations
      return filtered.map((prep, index) => ({ ...prep, order: index }));
    });
  };

  const togglePreparationComplete = (id: string) => {
    setPreparations(prev => prev.map(prep => 
      prep.id === id 
        ? { 
            ...prep, 
            isCompleted: !prep.isCompleted,
            completedAt: !prep.isCompleted ? new Date() : undefined,
          }
        : prep
    ));
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      <DialogBackdrop
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        aria-hidden="true"
      />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-3xl md:max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[98vh]">
          {showDeleteConfirm ? (
            <div className="p-8 overflow-y-auto">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Delete Custom Item</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to delete this custom plan item?</p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-800 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex justify-between items-center px-8 py-5 border-b bg-white/80 backdrop-blur">
                <h3 className="text-xl font-semibold text-gray-900">
                  Edit item: {editingItem?.title}
                </h3>
              </div>

              {/* Scrollable Content */}
              <div className="px-8 py-6 overflow-y-auto flex-1">
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="customDescription" className="block text-sm font-medium text-gray-700">
                      Add comment to the material (Description):
                    </label>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <TextEditor content={description} onChange={setDescription} />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={isReserve}
                        onChange={(e) => setIsReserve(e.target.checked)}
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Mark as Reserve Item
                      </span>
                    </label>
                    <p className="text-xs text-gray-500 ml-7">
                      Reserve items are backup materials that can be used if needed during the event.
                    </p>
                  </div>

                  {/* Preparations Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700">
                        Required To Do
                      </label>
                      <button
                        type="button"
                        onClick={addPreparation}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-md transition-colors"
                      >
                        <IconPlus size={16} />
                        Add To Do
                      </button>
                    </div>

                    {preparations.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                        <p className="text-sm">No to do items added yet</p>
                        <p className="text-xs mt-1">Click &ldquo;Add To Do&rdquo; to get started</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {preparations.map((prep, index) => (
                          <div key={prep.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                            <div className="flex items-center cursor-move text-gray-400">
                              <IconGripVertical size={16} />
                            </div>
                            
                            <button
                              type="button"
                              onClick={() => togglePreparationComplete(prep.id)}
                              className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                prep.isCompleted 
                                  ? 'bg-green-500 border-green-500 text-white' 
                                  : 'border-gray-300 hover:border-gray-400'
                              }`}
                            >
                              {prep.isCompleted && <IconCheck size={12} />}
                            </button>

                            <input
                              type="text"
                              value={prep.title}
                              onChange={(e) => updatePreparation(prep.id, { title: e.target.value })}
                              placeholder={`To Do ${index + 1}`}
                              className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />

                            <button
                              type="button"
                              onClick={() => deletePreparation(prep.id)}
                              className="flex-shrink-0 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                              title="Delete to do item"
                            >
                              <IconTrash size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sticky Footer Buttons */}
              <div className="px-8 py-5 border-t bg-gray-50 flex gap-3">
                <button
                  onClick={handleSubmit}
                  className={`px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                >
                  Save
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 bg-white border border-gray-300 text-gray-800 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default ItemModal;
