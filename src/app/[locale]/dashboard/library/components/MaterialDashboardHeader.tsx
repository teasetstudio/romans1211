'use client';

import { deleteMaterial } from '@/api/requests/materials';
import DeleteButton from '@/components/buttons/DeleteButton';
import { ROUTE_DASHBOARD_LIBRARY } from '@/res/routes';
import { TMaterialType } from '@/types/Materials';
import { getDashboardEditMaterialUrl } from '@/utils/urls';
import { Link } from '@/i18n/routing';
import { useRouter } from '@/i18n/routing';
import { IconArrowLeft } from '@/res/icons';
import { NAMESPACE_DASHBOARD } from '@/res/namespaces';
import { useTranslations } from 'next-intl';

interface MaterialActionsProps {
  materialId: string;
  type: TMaterialType;
}

const MaterialDashboardHeader = ({
  materialId,
  type,
}: MaterialActionsProps) => {
  const router = useRouter();
  const t = useTranslations(NAMESPACE_DASHBOARD);

  const handleDelete = async () => {
    await deleteMaterial(materialId, type);
    router.push(ROUTE_DASHBOARD_LIBRARY);
  };

  const editMaterialUrl = getDashboardEditMaterialUrl({type, id: materialId});

  return (
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
          {t('edit')}
        </Link>
        <DeleteButton
          onDelete={handleDelete}
          confirmText={t('confirm_delete_material', { type })}
          className="shadow-md hover:shadow-lg"
        />
      </div>
    </div>
  )
}

export default MaterialDashboardHeader
