"use client"

import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import TextEditor from "@/components/inputs/TextEditor";
import { useState, useEffect } from "react";
import { IconTrash, IconPlus, IconGripVertical } from "@tabler/icons-react";
import { IDefaultPlanItem, IDefaultPreparation } from '@/types/PlanItem';

// Local interface for form state (simpler version)
interface IPreparationForm {
  id: string;
  title: string;
  order: number;
}

interface CustomItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Partial<IDefaultPlanItem>) => void;
  onDelete?: (itemId: string) => void;
  editingItem?: IDefaultPlanItem | null;
  isEditing: boolean;
}

const DefaultItemModal = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  editingItem,
  isEditing,
}: CustomItemModalProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState(editingItem?.description || "");
  const [preparations, setPreparations] = useState<IDefaultPreparation[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Reset form or populate with editing item when modal opens/changes
  useEffect(() => {
    if (isOpen && isEditing && editingItem) {
      setTitle(editingItem.title || "");
      // Convert IPreparation[] to IPreparationForm[] for editing
      const formPreparations = (editingItem.preparations || []).map(prep => ({
        id: prep.id,
        title: prep.title,
        order: prep.order,
      }));
      setPreparations(formPreparations);
      setShowDeleteConfirm(false);
    } else if (isOpen && !isEditing) {
      setTitle("");
      setDescription("");
      setPreparations([]);
      setShowDeleteConfirm(false);
    }
  }, [isOpen, isEditing, editingItem]);

  const handleSubmit = () => {
    if (!title.trim()) return;

    onSave({
      title,
      description,
      // Convert IPreparationForm[] back to IPreparation[] format
      preparations: preparations.map((prep, idx) => ({
        ...prep,
        order: idx + 1,
      })),
    });

    // Reset form
    setTitle("");
    setDescription("");
    setPreparations([]);
  };

  const handleDelete = () => {
    if (editingItem && onDelete) {
      onDelete(editingItem.id);
    }
    setShowDeleteConfirm(false);
  };

  // Preparation management functions
  const addPreparation = () => {
    const highestOrder = preparations.reduce(
      (max, item) => Math.max(max, item.order),
      1
    );
    const newPrep: IPreparationForm = {
      id: `temp-${Date.now()}`, // Temporary ID for new items
      title: "",
      order: highestOrder + 1,
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
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Delete
                </button>
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
                  {isEditing ? "Edit Custom Plan Item" : "Add Custom Plan Item"}
                </h3>
                {isEditing && onDelete && (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="p-1.5 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50"
                    title="Delete item"
                  >
                    <IconTrash size={18} />
                  </button>
                )}
              </div>

              {/* Scrollable Content */}
              <div className="px-8 py-6 overflow-y-auto flex-1">
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="customTitle" className="block text-sm font-medium text-gray-700">
                      Title
                    </label>
                    <input
                      id="customTitle"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter title"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="customDescription" className="block text-sm font-medium text-gray-700">
                      Description (optional)
                    </label>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <TextEditor content={description} onChange={setDescription} />
                    </div>
                  </div>

                  {/* Preparations Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700">
                        Required Preparations
                      </label>
                      <button
                        type="button"
                        onClick={addPreparation}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-md transition-colors"
                      >
                        <IconPlus size={16} />
                        Add Preparation
                      </button>
                    </div>

                    {preparations.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                        <p className="text-sm">No preparations added yet</p>
                        <p className="text-xs mt-1">Click &ldquo;Add Preparation&rdquo; to get started</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {preparations.map((prep, index) => (
                          <div key={prep.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                            <div className="flex items-center cursor-move text-gray-400">
                              <IconGripVertical size={16} />
                            </div>

                            <input
                              type="text"
                              value={prep.title}
                              onChange={(e) => updatePreparation(prep.id, { title: e.target.value })}
                              placeholder={`Preparation ${index + 1}`}
                              className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />

                            <button
                              type="button"
                              onClick={() => deletePreparation(prep.id)}
                              className="flex-shrink-0 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                              title="Delete preparation"
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
                  disabled={!title.trim()}
                  className={`px-5 py-2.5 ${!title.trim() ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'} text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                >
                  {isEditing ? "Save Changes" : "Add Item"}
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

export default DefaultItemModal; 