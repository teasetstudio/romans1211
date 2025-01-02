import TColors from '@/types/ColorType'

interface Props {
  children: React.ReactNode
  className?: string
  weight?: 'regular' | 'medium'
  color?: TColors
}

const H10 = ({
  children,
  className = '',
  weight = 'regular',
  color = 'text-dark',
}: Props) => (
  <p className={`${className} ${color} text-xs font-${weight}`}>{children}</p>
)

export default H10
