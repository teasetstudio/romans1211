export interface AsyncParams<Params = { id: string }, SearchParams = {}> {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>
}

export interface ILibraryCatalogSearchParams {
  type?: string,
  page?: string,
  limit?: string,
  'search-term'?: string,
  tags?: string
}

export type ILibrarySearchParams = AsyncParams<{}, ILibraryCatalogSearchParams>