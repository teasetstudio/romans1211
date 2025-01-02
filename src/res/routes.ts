export const ROUTE_LOGIN = '/login'
export const ROUTE_REGISTER = '/register'
export const ROUTE_LIBRARY = '/library-catalog'
export const ROUTE_USER = '/user'
export const ROUTE_CART = '/user/cart'
export const ROUTE_AD_MANAGER = '/user/ad-manager'
export const ROUTE_MEDIA_LIBRARY = '/user/media-library'
export const ROUTE_PAPER = '/paper'
export const ROUTE_SOCIAL_MEDIA = '/social'
export const ROUTE_ONLINE = '/online'
export const ROUTE_RADIO = '/radio'
export const ROUTE_TOS = '/terms-of-service'
export const ROUTE_ABOUT = '/about'
export const ROUTE_CONTACT = '/contact'
export const ROUTE_MEDIA = '/media'
export const ROUTE_MEDIA_HREF = '/media/[slug]'
export const ROUTE_PRODUCT = '/product'
export const ROUTE_PRODUCT_HREF = '/media/[slug]/[productSlug]'
export const ROUTE_CHECKOUT = '/checkout' // TEMP
export const ROUTE_DASHBOARD = '/dashboard'
export const ROUTE_DASHBOARD_LIBRARY = '/dashboard/library'
export const ROUTE_DASHBOARD_MATERIAL_CREATE = '/dashboard/library/create-material'
export const ROUTE_SETTINGS = '/dashboard/settings'

export const footerLinks = [
  {
    title: 'footer.products',
    items: [
      {
        title: 'footer.text',
        link: `${ROUTE_LIBRARY}?type=text`,
      },
      {
        title: 'footer.song',
        link: `${ROUTE_LIBRARY}?type=song`,
      },
      {
        title: 'footer.game',
        link: `${ROUTE_LIBRARY}?type=game`,
      },
    ],
  },
  {
    title: 'footer.page',
    items: [
      {
        title: 'footer.library',
        link: ROUTE_LIBRARY,
      },
      {
        title: 'footer.tos',
        link: ROUTE_TOS,
      },
      {
        title: 'footer.about',
        link: ROUTE_ABOUT,
      },
      {
        title: 'footer.contact',
        link: ROUTE_CONTACT,
      },
    ],
  },
]
