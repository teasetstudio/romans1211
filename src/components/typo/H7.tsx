import TColors from '@/types/ColorType'

interface Props {
  children: React.ReactNode
  className?: string
  weight?: 'regular' | 'medium' | 'semibold' | 'bold'
  color?: TColors
  fontSize?: string
}

const H7 = ({
  children,
  className = '',
  weight = 'regular',
  color = 'text-dark',
  fontSize = 'text-tiny laptop:text-base',
}: Props) => (
  <p className={`${className} ${color} font-${weight} ${fontSize}`}>
    {children}
  </p>
)

export default H7
