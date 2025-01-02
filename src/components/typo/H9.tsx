import TColors from '@/types/ColorType'

interface Props {
  children: React.ReactNode
  className?: string
  weight?: 'medium' | 'semibold'
  color?: TColors
}

const H9: React.FC<Props> = ({
  children,
  className = '',
  weight = 'medium',
  color = 'text-dark',
}) => (
  <p className={`${className} ${color} font-${weight} text-sm`}>{children}</p>
)

export default H9
