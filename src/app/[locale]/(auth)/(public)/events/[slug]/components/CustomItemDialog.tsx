"use client";

import { Fragment, useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { IconChevronDown, IconChevronUp, IconCheck, IconClipboardList } from "@tabler/icons-react";
import type { PreparationItem } from "@prisma/client";

type CustomItemDialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  badge?: string;
  contentHtml?: string | null;
  preparations?: PreparationItem[];
};

export default function CustomItemDialog({ open, onClose, title, badge = "Custom", contentHtml, preparations }: CustomItemDialogProps) {
  const [expandedPreparations, setExpandedPreparations] = useState(false);
  return (
    <Dialog open={open} onClose={onClose} as={Fragment}>
      <div className="fixed inset-0 z-[10001] flex items-center justify-center top-0">
        <DialogBackdrop className="fixed inset-0 bg-black/50" />

        <DialogPanel className="relative bg-white rounded-lg shadow-xl w-full mx-4 max-h-[90vh] overflow-hidden max-w-4xl">
          <div className="px-6 py-4 border-b bg-amber-50 border-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-amber-900">{title}</h3>
              {badge ? (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">{badge}</span>
              ) : null}
            </div>
            <button
              type="button"
              className="text-gray-500 hover:text-gray-700"
              onClick={onClose}
            >
              Close
            </button>
          </div>

          <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-150px)]">
            {contentHtml ? (
              <div
                className="tiptap-wrapper whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: contentHtml }}
              />
            ) : (
              <div className="text-sm text-gray-500">No description</div>
            )}
            
            {/* Preparations Section */}
            {preparations && preparations.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div 
                  className="flex items-center text-sm text-gray-700 cursor-pointer hover:text-gray-900 mb-3"
                  onClick={() => setExpandedPreparations(!expandedPreparations)}
                >
                  <IconClipboardList size={16} className="mr-2" />
                  {expandedPreparations ? (
                    <>
                      <IconChevronUp size={16} className="mr-1" />
                      To Do ({preparations.filter(p => p.isCompleted).length}/{preparations.length})
                    </>
                  ) : (
                    <>
                      <IconChevronDown size={16} className="mr-1" />
                      To Do ({preparations.filter(p => p.isCompleted).length}/{preparations.length})
                    </>
                  )}
                </div>
                
                {expandedPreparations && (
                  <div className="space-y-3">
                    {preparations.map((prep) => (
                      <div key={prep.id} className="flex items-center gap-3">
                        <div
                          className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center ${
                            prep.isCompleted 
                              ? 'bg-green-500 border-green-500 text-white' 
                              : 'border-gray-300'
                          }`}
                        >
                          {prep.isCompleted && <IconCheck size={12} />}
                        </div>
                        <span className={`text-sm text-gray-700 ${prep.isCompleted ? 'line-through opacity-60' : ''}`}>
                          {prep.title}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
            <button
              type="button"
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
