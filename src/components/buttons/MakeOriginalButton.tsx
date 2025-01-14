'use client';

import { useState } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { IconCrown } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

interface MakeOriginalButtonProps {
  materialId: string;
}

export default function MakeOriginalButton({ materialId }: MakeOriginalButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMakeOriginal = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/materials/${materialId}/make-original`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to make material original');
      }

      setIsOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 py-1.5 px-2 text-sm text-slate-500 border border-slate-500 rounded-md hover:bg-amber-400 hover:text-white hover:border-amber-400 transition-colors"
      >
        <IconCrown size={16} />
        Make Original
      </button>

      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="mx-auto max-w-lg w-full rounded-lg bg-white p-6 shadow-xl">
            <DialogTitle className="text-lg font-medium mb-4">
              Make This Material Original
            </DialogTitle>

            <p className="text-gray-600 mb-4">
              This will make the current material the original version, and all other translations in this group will be updated to reference this as their original.
              Are you sure you want to continue?
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleMakeOriginal}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-amber-600 border border-transparent rounded-md hover:bg-amber-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Making Original...' : 'Make Original'}
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}
