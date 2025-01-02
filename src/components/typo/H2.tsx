import TColors from '@/types/ColorType'

interface Props {
  children: React.ReactNode
  className?: string
  color?: TColors
  fontSize?: string
}

const H2 = ({
  children,
  className = '',
  color = 'text-dark',
  fontSize = 'text-3xl laptop:text-4xl',
}: Props) => (
  <h2 className={`${className} ${color} font-medium ${fontSize}`}>
    {children}
  </h2>
)

export default H2
