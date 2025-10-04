"use client"

import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import TextEditor from "@/components/inputs/TextEditor";
import { useState, useEffect } from "react";
import { IPlanItem } from "@/types/PlanItem";

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Reset form or populate with editing item when modal opens/changes
  useEffect(() => {
    if (isOpen && editingItem) {
      setTitle(editingItem.title);
      setDescription(editingItem.description || "");
      setIsReserve(editingItem.isReserve || false);
      setShowDeleteConfirm(false);
    }
  }, [isOpen, editingItem]);

  const handleSubmit = () => {
    if (!title.trim()) return;

    onSave({
      title,
      description,
      isReserve,
    });

    // Reset form
    setTitle("");
    setDescription("");
    setIsReserve(false);
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
