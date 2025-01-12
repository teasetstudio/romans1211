import DashboardLibraryFilter from '@/components/forms/DashboardLibraryFilter'
import ActiveLibraryFilters from '@/components/widgets/ActiveLibraryFilters'
import { ILibraryCatalogSearchParams } from '@/types/Params'

interface IProps {
  searchParams: ILibraryCatalogSearchParams
}

const LibraryFilters = ({ searchParams }: IProps) => {
  const { type = '', page = '1', 'search-term': searchTerm, tags } = searchParams;
  const tagsArray = tags ? tags.split(',') : [];

  return (
    <div className="container space-y-4">
      <DashboardLibraryFilter searchParams={searchParams} />
      <ActiveLibraryFilters
        page={page}
        searchTerm={searchTerm}
        tags={tagsArray}
        type={type}
      />
    </div>
  )
}

export default LibraryFilters