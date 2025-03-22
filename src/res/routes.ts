export const ROUTE_LIBRARY = '/library-catalog'
export const ROUTE_MATERIAL = '/library-catalog/material'
export const ROUTE_LOGIN = '/login'
export const ROUTE_REGISTER = '/register'
export const ROUTE_TOS = '/terms-of-service'
export const ROUTE_ABOUT = '/about'
export const ROUTE_CONTACT = '/contact'
// Dashboard
export const ROUTE_DASHBOARD = '/dashboard'
export const ROUTE_DASHBOARD_ORGANIZATIONS = '/dashboard/organizations'
export const ROUTE_DASHBOARD_ORGANIZATIONS_NEW = '/dashboard/organizations/new'
export const ROUTE_DASHBOARD_ORGANIZATIONS_SETTINGS = (id: string) => `${ROUTE_DASHBOARD_ORGANIZATIONS}/${id}/settings/profile`
export const ROUTE_DASHBOARD_LIBRARY = '/dashboard/library'
export const ROUTE_DASHBOARD_COURSES = '/dashboard/courses'
export const ROUTE_DASHBOARD_EVENTS = '/dashboard/events'
export const ROUTE_DASHBOARD_EVENT = (id: string) => `${ROUTE_DASHBOARD_EVENTS}/${id}`
export const ROUTE_DASHBOARD_MATERIAL = '/dashboard/library/material'
export const ROUTE_DASHBOARD_MATERIAL_CREATE = '/dashboard/library/material/create'
export const ROUTE_SETTINGS = '/dashboard/settings'

export const ROUTE_MEDIA_HREF = '/media/[slug]' // Temp | How [slug] works here? Is it outdated?

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
