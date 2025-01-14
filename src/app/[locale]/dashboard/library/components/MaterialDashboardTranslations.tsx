import { TMaterialType, TMaterialWithIncluded } from '@/types/Materials'
import { Link } from '@/i18n/routing';
import MakeOriginalButton from '@/components/buttons/MakeOriginalButton';
import { getDashboardMaterialUrl, getDashboardTranslateMaterialUrl } from '@/utils/urls';
import { IconPlus } from '@tabler/icons-react';

interface IProps {
  material: TMaterialWithIncluded
  type: TMaterialType
}

const MaterialDashboardTranslations = ({ material, type }: IProps) => {
  const original = material.original ? material.original : material;
  const childTranslations = material.original ? material.original.translations : material.translations;
  const translations = [original, ...(childTranslations ? childTranslations : [])];

  return (
    <div className="mb-4 flex flex-wrap justify-between">
      <div>
        <h2 className="text-gray-500 text-xs">Translations:</h2>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {translations.length > 0 && translations.map((translation) => (
            <Link
              key={translation.id}
              href={getDashboardMaterialUrl({ type, id: translation.id })}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ring-1
                ${translation.id === material.id ? 'bg-primary/10 text-primary ring-primary/20' :
                  'ring-gray-200 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900'}
              `}
            >
              {translation.language.toUpperCase()}
            </Link>
          ))}
        </div>
      </div>

      <div className='mt-2'>
        {material.originalId ? (
          <div className="flex flex-col items-end gap-1 text-gray-500">
            <MakeOriginalButton materialId={material.id} />
            <Link
              href={getDashboardMaterialUrl({ type, id: material.originalId })}
              className="py-1 text-xs font-medium hover:text-secondary text-slate-400 underline transition-colors"

            >
              Original Translation: {material.original?.language.toUpperCase()}
            </Link>
          </div>
        ) : (
          <Link
            href={getDashboardTranslateMaterialUrl({ type, originalId: material.id })}
            className="inline-flex items-center gap-2 py-1.5 px-2 text-sm text-slate-500 border border-slate-500 rounded-md hover:bg-amber-400 hover:text-white hover:border-amber-400 transition-colors"
          >
            <IconPlus size={14}/>
            Add Translation
          </Link>
        )}
      </div>
    </div>
  )
}

export default MaterialDashboardTranslations
