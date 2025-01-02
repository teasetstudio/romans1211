import TColors from '@/types/ColorType'

interface Props {
  children: React.ReactNode
  className?: string
  weight?: 'regular' | 'semibold'
  color?: TColors
  fontSize?: string
}

const H5 = ({
  children,
  className = '',
  weight = 'regular',
  color = 'text-dark',
  fontSize = 'text-base tablet:text-lg laptop:text-xl',
}: Props) => (
  <h5 className={`${className} ${color} font-${weight} ${fontSize}`}>
    {children}
  </h5>
)

export default H5
