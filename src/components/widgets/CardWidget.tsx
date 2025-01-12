import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';;
import H4 from '@/components/typo/H4';
import { NAMESPACE_WIDGETS } from '@/res/namespaces';
import Spinner from './ui/Spinner';
import WideLink from '../buttons/WideLink';
import CardGrid from '../CardGrid/CardGrid';
import { ICard } from '../CardGrid/Card';

interface ICardWidgetProps {
  className?: string;
  loadingState?: boolean;
  cards: Array<ICard> | null;
  title?: string;
  viewAllRoute?: string;
}

export default function CardWidget({
  className = '',
  loadingState = false,
  cards,
  title,
  viewAllRoute,
}: ICardWidgetProps) {
  const t = useTranslations(NAMESPACE_WIDGETS);

  return (
    <div className={className}>
      {(title || loadingState || viewAllRoute) &&
        <div className="container mb-8">
        <div className="flex justify-between items-center">
          <div className="flex space-x-2 items-center">
            {title && <H4 color="text-secondary">{title}</H4>}
            {loadingState && <Spinner sizeClass="w-5 h-5" />}
          </div>
          {viewAllRoute && (
            <Link
              href={viewAllRoute}
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              {t('view_all')} →
            </Link>
          )}
        </div>
      </div>
      }

      {cards && cards.length > 0 ? (
        <CardGrid cards={cards} />
      ) : (
        <div className="container">
          <p className="text-center text-gray-500">{t('no_materials')}</p>
        </div>
      )}
      {viewAllRoute && (
        <div className="container">
          <WideLink link={viewAllRoute} className="mt-7">
            {t('view_all')}
          </WideLink>
        </div>
      )}
    </div>
  );
}
