"use client"

import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import TextEditor from "@/components/inputs/TextEditor";
import { useState, useEffect } from "react";
import { IconTrash } from "@tabler/icons-react";
import { IPlanItem } from "@/types/PlanItem";

interface CustomItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Partial<IPlanItem>) => void;
  onDelete?: (itemId: string) => void;
  editingItem?: IPlanItem | null;
  isEditing: boolean;
}

const CustomItemModal = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  editingItem,
  isEditing,
}: CustomItemModalProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Reset form or populate with editing item when modal opens/changes
  useEffect(() => {
    if (isOpen && isEditing && editingItem) {
      setTitle(editingItem.title);
      setDescription(editingItem.description || "");
      setShowDeleteConfirm(false);
    } else if (isOpen && !isEditing) {
      setTitle("");
      setDescription("");
      setShowDeleteConfirm(false);
    }
  }, [isOpen, isEditing, editingItem]);

  const handleSubmit = () => {
    if (!title.trim()) return;

    onSave({
      title,
      description,
    });

    // Reset form
    setTitle("");
    setDescription("");
  };

  const handleDelete = () => {
    if (editingItem && onDelete) {
      onDelete(editingItem.id);
    }
    setShowDeleteConfirm(false);
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

export default CustomItemModal; 