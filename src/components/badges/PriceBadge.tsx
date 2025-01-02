import H2 from '@/components/typo/H2'
import H8 from '@/components/typo/H8'
import H9 from '@/components/typo/H9'

interface IProps {
  price: number
  currency: string
  className?: string
  size?: 'H2' | 'H8' | 'H9'
  paddingClass?: string
}

const PriceBadge = ({
  currency,
  price,
  className,
  size = 'H8',
  paddingClass = 'small:p-3 p-2',
}: IProps) => {
  const Component = size === 'H2' ? H2 : size === 'H8' ? H8 : H9

  return (
    <Component
      color="text-white"
      className={`${className} ${paddingClass} bg-primary inline-block rounded-lg cursor-pointer`}
    >
      {`${currency} ${price.toFixed(2)}`}
    </Component>
  )
}

export default PriceBadge
