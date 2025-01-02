import TColors from '@/types/ColorType'

interface Props {
  children: React.ReactNode
  className?: string
  color?: TColors
}

const H11 = ({ children = '', className, color = 'text-dark' }: Props) => (
  <p className={`${className} ${color} text-2xs`}>{children}</p>
)

export default H11
