'use client';

import { useMemo, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { IconTrash } from '@/res/icons';
import { useRouter } from 'next/navigation';
import { userInOrganizationData } from '@/utils/permissions';
import { useSession } from "next-auth/react";
import { useOrganization } from '../contexts/OrganizationContext';

interface DeleteMaterialButtonProps {
  materialId: string;
  isOriginal?: boolean;
  translationsCount?: number;
}

export default function DeleteMaterialButton({
  materialId,
  isOriginal = false,
  translationsCount = 0,
}: DeleteMaterialButtonProps) {
  const router = useRouter();
  const { selectedOrganization } = useOrganization();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);

  const handleDelete = async (deleteAll?: boolean) => {
    setIsSubmitting(true);
    setError('');

    try {
      const url = `/api/materials/${materialId}${deleteAll ? '?deleteAll=true' : ''}`;
      const response = await fetch(url, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        if (data.hasTranslations) {
          setShowDeleteAllConfirm(true);
          setError('');
          setIsSubmitting(false);
          return;
        }
        throw new Error(data.error || 'Failed to delete material');
      }

      setIsOpen(false);
      router.push('/dashboard/library');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const { hasDeletePermission } = useMemo(() => 
    userInOrganizationData(session?.user?.id ?? '', selectedOrganization), 
    [session?.user?.id, selectedOrganization]
  );

  if (!selectedOrganization) {
    return null;
  }

  if (!hasDeletePermission) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
      >
        <IconTrash size={16} />
        Delete
      </button>

      <Dialog
        open={isOpen}
        onClose={() => {
          if (!isSubmitting) {
            setIsOpen(false);
            setShowDeleteAllConfirm(false);
            setError('');
          }
        }}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-lg w-full rounded-lg bg-white p-6 shadow-xl">
            <Dialog.Title className="text-lg font-medium mb-4">
              {showDeleteAllConfirm
                ? 'Delete Material and All Translations?'
                : 'Delete Material?'}
            </Dialog.Title>

            {showDeleteAllConfirm ? (
              <div className="mb-6 text-gray-600">
                <p className="mb-2">
                  This material has {translationsCount} translation{translationsCount !== 1 ? 's' : ''}.
                  You have two options:
                </p>
                <ul className="list-disc ml-6 mb-4">
                  <li>Delete this material and all its translations</li>
                  <li>
                    Make another translation the original first (using the &quot;Make Original&quot; button)
                  </li>
                </ul>
                <p>What would you like to do?</p>
              </div>
            ) : (
              <p className="mb-6 text-gray-600">
                Are you sure you want to delete this material?{' '}
                {isOriginal && translationsCount > 0 && 'This will affect its translations.'}
                This action cannot be undone.
              </p>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setShowDeleteAllConfirm(false);
                  setError('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              {showDeleteAllConfirm ? (
                <button
                  type="button"
                  onClick={() => handleDelete(true)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Deleting...' : 'Delete All'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleDelete()}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Deleting...' : 'Delete'}
                </button>
              )}
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}
