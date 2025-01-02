import TColors from '@/types/ColorType'

interface Props {
  children: React.ReactNode
  className?: string
  color?: TColors
  fontSize?: string
}

const H3 = ({
  children,
  className = '',
  color = 'text-dark',
  fontSize = 'text-xl tablet:text-2xl laptop:text-3xl',
}: Props) => (
  <h3 className={`${className} ${color} font-medium ${fontSize}`}>
    {children}
  </h3>
)

export default H3
