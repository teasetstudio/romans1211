import TColors from '@/types/ColorType'

interface Props {
  children: React.ReactNode
  className?: string
  color?: TColors
  fontSize?: string
}

const H1 = ({
  children,
  className = '',
  color = 'text-dark',
  fontSize = 'text-3xl laptop:text-5xl',
}: Props) => (
  <h1 className={`${className} ${color} font-semibold ${fontSize}`}>
    {children}
  </h1>
)

export default H1
