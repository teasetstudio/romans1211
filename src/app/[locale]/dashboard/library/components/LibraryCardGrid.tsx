import TextButton from '@/components/buttons/TextButton'
import CardWidget from '@/components/widgets/CardWidget'
import { ROUTE_DASHBOARD_MATERIAL_CREATE } from '@/res/routes'
import { NAMESPACE_DASHBOARD } from '@/res/namespaces'
import { useTranslations } from 'next-intl'
import { ICard } from '@/components/CardGrid/Card'

interface IProps {
  cards: ICard[]
}

const LibraryCardGrid = ({ cards }: IProps) => {
  const t = useTranslations(NAMESPACE_DASHBOARD);

  return (
    <div className="min-h-[300px]">
      {cards.length === 0 ? (
        <p className="text-gray-500 container">
          {t('no_materials_found_1')}{` `}
          <TextButton 
            href={ROUTE_DASHBOARD_MATERIAL_CREATE} 
            className="text-primary underline hover:text-gray-900"
          >
            {t('no_materials_found_2')}
          </TextButton>{` `}
          {t('no_materials_found_3')}!
        </p>
      ) : (
        <CardWidget cards={cards} />
      )}
    </div>
  )
}

export default LibraryCardGrid