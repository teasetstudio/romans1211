import { ROUTE_MEDIA } from '@/res/routes'
export const getProductUrl = ({
  productSlug,
  mediaSlug,
}: {
  productSlug: number
  mediaSlug: number
}) => {
  return `${ROUTE_MEDIA}/${mediaSlug}/${productSlug}`
}
