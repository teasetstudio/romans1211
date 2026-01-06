import { TMaterialType, TMaterialWithIncluded } from '@/types/Materials'
import { ProgressLink as Link } from '@/components/buttons/ProgressLink';
import { getMaterialUrl } from '@/utils/urls';

interface IProps {
  material: TMaterialWithIncluded
  type: TMaterialType
}

const MaterialTranslations = ({ material, type }: IProps) => {
  const original = material.original ? material.original : material;
  const childTranslations = material.original ? material.original.translations : material.translations;
  const translations = [original, ...(childTranslations ? childTranslations : [])];

  return (
    <div className="mb-1 flex flex-col flex-wrap justify-between">
      <div className='flex flex-col items-end'>
        <h2 className="text-gray-500 text-xs">Translations:</h2>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {translations.length > 0 && translations.map((translation) => (
            <Link
              key={translation.id}
              href={getMaterialUrl({ type, id: translation.id })}
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

      {translations.length > 1 && (
        <div className='mt-2 text-gray-500 text-right'>
          {material.originalId ? (
            <Link
              href={getMaterialUrl({ type, id: material.originalId })}
              className="py-1 text-xs font-medium hover:text-secondary text-slate-400 underline transition-colors"
            >
              Original Translation: {material.original?.language.toUpperCase()}
            </Link>
          ) : (
            <span
              className="py-1 text-xs font-medium text-slate-400"
            >
              Original Translation
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default MaterialTranslations