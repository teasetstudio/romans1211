import { ROUTE_DASHBOARD_LIBRARY, ROUTE_EDIT, ROUTE_LIBRARY } from '@/res/routes'
import { TMaterialType } from '@/types/Materials'

type TGetMaterialUrlProps = { type: TMaterialType; id: string }
export const getMaterialUrl = ({ type, id }: TGetMaterialUrlProps) =>
  `${ROUTE_LIBRARY}/${type}/${id}`
export const getDashboardMaterialUrl = ({ type, id }: TGetMaterialUrlProps) =>
  `${ROUTE_DASHBOARD_LIBRARY}/${type}/${id}`
export const getDashboardEditMaterialUrl = ({ type, id }: TGetMaterialUrlProps) =>
  `${ROUTE_DASHBOARD_LIBRARY}/${type}/${id}${ROUTE_EDIT}`

// Helper function to build URL with params (used for filters on catalog pages)
type TAppendParamsToUrlProps = { url: string; params: { [key: string]: string | null } }
export const appendParamsToUrl = ({ url, params }: TAppendParamsToUrlProps) => {
  const urlParams = new URLSearchParams();
  if (params.type) urlParams.set('type', params.type);
  if (params['search-term']) urlParams.set('search-term', params['search-term']);
  if (params.page) urlParams.set('page', params.page);
  if (params.tags) urlParams.set('tags', params.tags);

  return `${url}?${urlParams.toString()}`;
};