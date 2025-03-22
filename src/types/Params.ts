import { TMaterialType } from "./Materials";

export interface AsyncParams<Params = { id: string }, SearchParams = {}> {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>
}

export interface ILibraryCatalogSearchParams {
  type?: string,
  page?: string,
  limit?: string,
  'search-term'?: string,
  tags?: string,
  originalOnly?: string,
}

export type ILibrarySearchParams = AsyncParams<{}, ILibraryCatalogSearchParams>
export type IdAndTypeParams = AsyncParams<{ id: string; type: TMaterialType }>;

export type AsyncIdParam = Promise<{ id: string }>