'use client';

import Link from 'next/link';
import { IconArrowLeft, IconPencil } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { NAMESPACE_DASHBOARD } from '@/res/namespaces';
import { ROUTE_DASHBOARD_LIBRARY } from '@/res/routes';
import { TMaterialType } from '@/types/Materials';
import { getDashboardEditMaterialUrl } from '@/utils/urls';
import DeleteMaterialButton from '@/components/buttons/DeleteMaterialButton';

interface MaterialDashboardHeaderProps {
  materialId: string;
  isOriginal: boolean;
  translationsCount: number;
  type: TMaterialType;
}

export default function MaterialDashboardHeader({
  materialId,
  isOriginal,
  translationsCount,
  type,
}: MaterialDashboardHeaderProps) {
  const t = useTranslations(NAMESPACE_DASHBOARD);
  const editMaterialUrl = getDashboardEditMaterialUrl({type, id: materialId});

  return (
    <div className="flex flex-col justify-between">
      <div className="flex flex-row justify-between gap-4 mb-3">
        <Link
          href={ROUTE_DASHBOARD_LIBRARY}
          className="inline-flex items-center justify-center w-10 h-10 rounded-[12px] bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
        >
          <IconArrowLeft className="w-5 h-5" />
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href={editMaterialUrl}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-secondary rounded-[12px] transition-colors shadow-md hover:shadow-lg"
          >
            <IconPencil size={16} />
            {t('edit')}
          </Link>
          <DeleteMaterialButton 
            materialId={materialId}
            isOriginal={isOriginal}
            translationsCount={translationsCount}
          />
        </div>
      </div>
    </div>
  );
}
