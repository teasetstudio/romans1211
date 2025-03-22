
import TextButton from '@/components/buttons/TextButton'
import { ROUTE_DASHBOARD_MATERIAL_CREATE } from '@/res/routes'
import { NAMESPACE_DASHBOARD } from '@/res/namespaces'
import { useTranslations } from 'next-intl'

interface IProps {
  totalCount: number
}

const LibraryHeader = ({ totalCount }: IProps) => {
  const t = useTranslations(NAMESPACE_DASHBOARD);

  return (
    <div className="container">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('library')}</h1>
          <p className="text-sm text-gray-600">{t('total_items', { totalCount })}</p>
        </div>
        <TextButton 
          href={ROUTE_DASHBOARD_MATERIAL_CREATE} 
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          {t('create_resource')}
        </TextButton>
      </div>
    </div>
  )
}

export default LibraryHeader