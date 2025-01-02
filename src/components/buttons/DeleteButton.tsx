'use client';

import { useState } from 'react';
import clsx from 'clsx';

interface DeleteButtonProps {
  onDelete: () => Promise<void>;
  confirmText?: string;
  className?: string;
}

export default function DeleteButton({
  onDelete,
  confirmText = 'Are you sure you want to delete this?',
  className,
}: DeleteButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!isConfirming) {
      setIsConfirming(true);
      return;
    }

    try {
      setIsDeleting(true);
      await onDelete();
    } catch (error) {
      setIsDeleting(false);
      setIsConfirming(false);
    }
  };

  const handleCancel = () => {
    setIsConfirming(false);
  };

  return (
    <div className={clsx('flex items-center gap-2', className)}>
      {isConfirming && (
        <>
          <span className="text-sm text-gray-600">{confirmText}</span>
          <button
            onClick={handleCancel}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
            disabled={isDeleting}
          >
            Cancel
          </button>
        </>
      )}
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className={clsx(
          'px-3 py-1 rounded-md text-sm font-medium transition-colors',
          isConfirming
            ? 'bg-red-600 text-white hover:bg-red-700'
            : 'text-red-600 hover:text-red-700'
        )}
      >
        {isDeleting ? 'Deleting...' : isConfirming ? 'Confirm' : 'Delete'}
      </button>
    </div>
  );
}
