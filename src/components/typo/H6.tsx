import TColors from '@/types/ColorType'

interface Props {
  children: React.ReactNode
  className?: string
  color?: TColors
  fontSize?: string
}

const H6 = ({
  children,
  className = '',
  color = 'text-dark',
  fontSize = 'text-lg',
}: Props) => (
  <h6 className={`${className} ${color} font-semibold ${fontSize}`}>
    {children}
  </h6>
)

export default H6
