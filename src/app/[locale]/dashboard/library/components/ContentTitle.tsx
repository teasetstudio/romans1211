import MaterialTypeBadge from '@/components/badges/MaterialTypeBadge'
import VisibilityBadge from '@/components/badges/VisibilityBadge';
import { TMaterial, TMaterialType } from '@/types/Materials';
import { getFullUrl, getMaterialUrl } from '@/utils/urls';

interface IProps {
  material: TMaterial;
  type: TMaterialType;
}

const ContentTitle = ({ material, type }: IProps) => {
  const publicUrl = material.isPublic ? getFullUrl(getMaterialUrl({ type, id: material.id })) : undefined
  return (
    <div className="flex items-center justify-between mb-4">
      <h1 className="text-3xl font-bold text-dark">{material.title}</h1>
      <div className="absolute top-2 right-2 flex gap-1">
        <VisibilityBadge
          isPublic={material.isPublic}
          publicUrl={publicUrl}
        />
        <MaterialTypeBadge type={type} />
      </div>
    </div>
  )
}

export default ContentTitle