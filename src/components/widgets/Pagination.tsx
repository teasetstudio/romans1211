import Link from 'next/link'

interface IProps {
  className?: string
  totalPages: number
  currentPage: number
  buildUrl: (page: number) => string
}

const Pagination = ({ totalPages, currentPage, buildUrl, className }: IProps) => {
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
                Previous
              </Link>
            )}

            <span className="px-4 py-2">
              Page {currentPage} of {totalPages}
            </span>

            {currentPage < totalPages && (
              <Link
                href={buildUrl(currentPage + 1)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default Pagination