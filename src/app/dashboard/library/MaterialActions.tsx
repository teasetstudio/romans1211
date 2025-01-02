'use client';

import { deleteMaterial } from '@/api/requests/materials';
import DeleteButton from '@/components/buttons/DeleteButton';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface MaterialActionsProps {
  materialId: string;
  organizationName: string;
  type: 'text' | 'song' | 'game';
}

export default function MaterialActions({
  materialId,
  organizationName,
  type,
}: MaterialActionsProps) {
  const router = useRouter();

  const handleDelete = async () => {
    await deleteMaterial(materialId, type);
    router.push('/dashboard/library');
  };

  return (
    <div className="flex items-center gap-4">
      <div className="text-gray-500">Organization: {organizationName}</div>
      <Link
        href={`/dashboard/library/${type}/${materialId}/edit`}
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Edit Material
      </Link>
      <DeleteButton
        onDelete={handleDelete}
        confirmText={`Are you sure you want to delete this ${type}?`}
      />
    </div>
  );
}
