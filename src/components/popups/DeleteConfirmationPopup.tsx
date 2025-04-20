'use client';

import { NAMESPACE_COMMON } from '@/res/namespaces';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import { useTranslations } from 'next-intl';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  confirmText: string;
  isDeleting: boolean;
}

export default function DeleteConfirmationPopup({
  isOpen,
  onClose,
  onConfirm,
  confirmText,
  isDeleting,
}: DeleteConfirmationModalProps) {
  const t = useTranslations(NAMESPACE_COMMON);
 
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      <DialogBackdrop 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm"
        aria-hidden="true"
      />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-sm bg-white rounded-xl p-6 shadow-xl">
          <div className="flex flex-col gap-6">
            <div className="text-sm text-gray-600" dangerouslySetInnerHTML={{ __html: confirmText }} />
            
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                disabled={isDeleting}
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={onConfirm}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors"
              >
                {isDeleting ? t('deleting') : t('delete')}
              </button>
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
