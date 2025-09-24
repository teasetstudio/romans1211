'use client';

import MaterialTypeBadge from '@/components/badges/MaterialTypeBadge'
import VisibilityBadge from '@/components/badges/VisibilityBadge';
import { TMaterialType } from '@/types/Materials';
import { getFullUrl, getMaterialUrl } from '@/utils/urls';
import { useMaterial } from './MaterialStateProvider';
import { useNavigateWithProgress } from '@/hooks/useNavigateWithProgress';

interface IProps {
  type: TMaterialType;
}

const ContentTitle = ({ type }: IProps) => {
  const { material } = useMaterial();
  const publicUrl = material.isPublic ? getFullUrl(getMaterialUrl({ type, id: material.id })) : undefined;
  const { navigateWithProgress } = useNavigateWithProgress();

  const onTypeChange = (newMaterialId: string, newType: TMaterialType) => {
    const targetUrl = `/dashboard/library/material/${newType}/${newMaterialId}`;
    navigateWithProgress(targetUrl);
  };

  return (
    <div className="flex items-center justify-between mb-4">
      <h1 className="text-3xl font-bold text-dark">{material.title}</h1>
      <div className="absolute top-2 right-2 flex gap-1">
        <VisibilityBadge
          isPublic={material.isPublic}
          publicUrl={publicUrl}
        />
        <MaterialTypeBadge type={type} isEditable={!material.originalId} materialId={material.id} onTypeChange={onTypeChange} />
      </div>
    </div>
  )
}

export default ContentTitle