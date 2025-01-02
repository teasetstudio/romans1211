import TColors from '@/types/ColorType'

interface Props {
  children: React.ReactNode
  className?: string
  weight?: 'medium' | 'semibold'
  color?: TColors
  fontSize?: string
}

const H8 = ({
  children,
  className = '',
  weight = 'medium',
  color = 'text-dark',
  fontSize = 'text-sm laptop:text-tiny',
}: Props) => (
  <p className={`${className} ${color} font-${weight} ${fontSize}`}>
    {children}
  </p>
)

export default H8
