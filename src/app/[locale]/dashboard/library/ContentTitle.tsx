import MaterialTypeBadge from '@/components/badges/MaterialTypeBadge'
import { TMaterialType } from '@/types/Materials';

interface IProps {
  title: string;
  type: TMaterialType;
}

const ContentTitle = ({ title, type }: IProps) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <h1 className="text-3xl font-bold text-dark">{title}</h1>
      <div className="absolute top-2 right-2">
        <MaterialTypeBadge type={type} />
      </div>
    </div>
  )
}

export default ContentTitle