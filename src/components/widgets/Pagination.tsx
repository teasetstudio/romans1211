import Link from 'next/link'

interface IProps {
  className?: string
  totalPages: number
  page: number
  buildUrl: (page: number) => string
}

const Pagination = ({ totalPages, page, buildUrl, className }: IProps) => {
  return (
    <>
      {totalPages > 1 && (
        <div className={className}>
          <div className="flex justify-center gap-2 mt-8">
          {page > 1 && (
            <Link
              href={buildUrl(page - 1)}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Previous
            </Link>
          )}

          <span className="px-4 py-2">
            Page {page} of {totalPages}
          </span>

          {page < totalPages && (
            <Link
              href={buildUrl(page + 1)}
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