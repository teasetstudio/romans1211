'use client';

import { useState } from 'react';
import clsx from 'clsx';
import DeleteConfirmationPopup from '../popups/DeleteConfirmationPopup';

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
    <>
      <button
        onClick={() => setIsConfirming(true)}
        disabled={isDeleting}
        className={clsx(
          "px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-colors",
          className
        )}
      >
        Delete
      </button>

      <DeleteConfirmationPopup
        isOpen={isConfirming}
        onClose={handleCancel}
        onConfirm={handleDelete}
        confirmText={confirmText}
        isDeleting={isDeleting}
      />
    </>
  );
}
