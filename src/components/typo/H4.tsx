import TColors from '@/types/ColorType'

interface Props {
  children: React.ReactNode
  className?: string
  color?: TColors
  fontSize?: string
}

const H4 = ({
  children,
  className = '',
  color = 'text-dark',
  fontSize = 'text-xl laptop:text-2xl',
}: Props) => (
  <h4 className={`${className} ${color} font-bold ${fontSize}`}>{children}</h4>
)

export default H4
