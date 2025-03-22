import { ROUTE_DASHBOARD_COURSES, ROUTE_DASHBOARD_MATERIAL, ROUTE_MATERIAL } from '@/res/routes'
import { TMaterialType } from '@/types/Materials'

type TGetMaterialUrlProps = { type: TMaterialType; id: string }
export const getMaterialUrl = ({ type, id }: TGetMaterialUrlProps) =>
  `${ROUTE_MATERIAL}/${type}/${id}`
export const getDashboardMaterialUrl = ({ type, id }: TGetMaterialUrlProps) =>
  `${ROUTE_DASHBOARD_MATERIAL}/${type}/${id}`
export const getDashboardEditMaterialUrl = ({ type, id }: TGetMaterialUrlProps) =>
  `${ROUTE_DASHBOARD_MATERIAL}/${type}/${id}/edit`
type TTranslateMaterialUrlProps = { type: TMaterialType; originalId: string }
export const getDashboardTranslateMaterialUrl = ({ type, originalId }: TTranslateMaterialUrlProps) =>
  `${ROUTE_DASHBOARD_MATERIAL}/${type}/${originalId}/translate`

export const getDashboardCourseUrl = (id: string) => `${ROUTE_DASHBOARD_COURSES}/${id}`

type TAppendParamsToUrlProps = { url: string; params: { [key: string]: string | null } }
export const appendParamsToUrl = ({ url, params }: TAppendParamsToUrlProps) => {
  const urlParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      urlParams.set(key, value);
    }
  });

  const queryString = urlParams.toString();
  return queryString ? `${url}?${queryString}` : url;
};

export const getFullUrl = (path: string): string => {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${path}`
  }
  // Fallback for server-side rendering
  return `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}${path}`
}
