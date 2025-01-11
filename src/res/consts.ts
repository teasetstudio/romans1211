export const WEEK_DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]

export const MONTHS = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
]

export const SWISS_INT_FORMAT = new Intl.NumberFormat('de-CH', {
  style: 'decimal',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export const SUPPORTED_FORMATS = ['image/jpg', 'image/jpeg', 'image/png']

export const DEFAULT_LANG = 'de'

export const swVatPercent = 0.077
export const cropAspectRatio = 1.7777777777777777

export const defaultResendEmail = process.env.RESEND_EMAIL || 'ChristianMaterials@onelib.click'
