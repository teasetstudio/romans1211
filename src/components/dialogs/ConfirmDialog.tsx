"use client";

import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import Button from "@/components/buttons/Button";
import { IconClose, IconTrash } from "@/res/icons";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  variant?: "danger" | "warning" | "default";
  isLoading?: boolean;
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  variant = "default",
  isLoading = false,
}: ConfirmDialogProps) {
  if (!open) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          confirmButton: "bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700",
          icon: <IconTrash className="w-5 h-5 text-red-600" />,
        };
      case "warning":
        return {
          confirmButton: "bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-600 hover:border-yellow-700",
          icon: <div className="w-5 h-5 text-yellow-600">⚠</div>,
        };
      default:
        return {
          confirmButton: "bg-primary hover:bg-primary/90 text-white border-primary hover:border-primary/90",
          icon: null,
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 shadow-xl">
          <div className="flex items-start gap-4">
            {styles.icon && (
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                {styles.icon}
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <DialogTitle className="text-lg font-medium text-gray-900">
                  {title}
                </DialogTitle>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500 transition-colors"
                  disabled={isLoading}
                >
                  <IconClose className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                {message}
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  onClick={onClose}
                  className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  type="button"
                  disabled={isLoading}
                >
                  {cancelText}
                </Button>
                <Button
                  onClick={onConfirm}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${styles.confirmButton}`}
                  type="button"
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : confirmText}
                </Button>
              </div>
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
