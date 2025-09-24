import { ProgressLink as Link } from '@/components/buttons/ProgressLink';
import { NAMESPACE_COMMON } from '@/res/namespaces';
import { useTranslations } from 'next-intl';

interface IProps {
  className?: string
  totalPages: number
  currentPage: number
  buildUrl: (page: number) => string
}

const Pagination = ({ totalPages, currentPage, buildUrl, className }: IProps) => {
  const t = useTranslations(NAMESPACE_COMMON);

  return (
    <>
      {totalPages > 1 && (
        <div className={className}>
          <div className="flex justify-center gap-2 mt-8">
            {currentPage > 1 && (
              <Link
                href={buildUrl(currentPage - 1)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                {t('previous')}
              </Link>
            )}

            <span className="px-4 py-2">
              {t('page_of', { currentPage, totalPages })}
            </span>

            {currentPage < totalPages && (
              <Link
                href={buildUrl(currentPage + 1)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                {t('next')}
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default Pagination