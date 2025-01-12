import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';;
import H4 from '@/components/typo/H4';
import { NAMESPACE_WIDGETS } from '@/res/namespaces';
import Spinner from './ui/Spinner';
import WideLink from '../buttons/WideLink';
import GameGrid from '../CardGrid/GameGrid';
import { IGameCard } from '../CardGrid/GameCard';

interface IProps {
  className?: string;
  loadingState?: boolean;
  games: Array<IGameCard> | null;
  title: string;
  viewAllRoute?: string;
}

export default function GameWidget({
  className = '',
  loadingState = false,
  games,
  title,
  viewAllRoute,
}: IProps) {
  const t = useTranslations(NAMESPACE_WIDGETS);

  return (
    <div className={className}>
      <div className="container mb-8">
        <div className="flex justify-between items-center">
          <div className="flex space-x-2 items-center">
            <H4 color="text-secondary">{title}</H4>
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

      {games && games.length > 0 ? (
        <GameGrid games={games} />
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
