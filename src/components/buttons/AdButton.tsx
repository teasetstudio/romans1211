import Button from '@/components/buttons/Button'
import H8 from '@/components/typo/H8'
import TColors, { TBGColors } from '@/types/ColorType'

type TGeneralProps = {
  icon: React.FC<React.SVGProps<SVGSVGElement>>
  title: string
  color?: TColors
  iconColor?: 'gray4' | 'secondary' | 'primary' | ''
  bgColor?: TBGColors
  className?: string
}

type TButton = TGeneralProps & {
  onClick(): void
  href?: never
}

type TLink = TGeneralProps & {
  href: string
  onClick?: never
}

type IProps = TButton | TLink

const AdButton = ({
  href,
  onClick,
  icon: Icon,
  iconColor = '',
  title,
  bgColor = 'bg-primary',
  color = 'text-gray4',
  className = '',
}: IProps) => {
  return (
    <Button
      href={href}
      onClick={onClick}
      className={`${className} flex items-center justify-center space-x-0.5 desktop:space-x-3 w-48 small:w-52`}
      paddingClass="py-2.5"
      bgColor={bgColor}
      rounded="rounded-lg"
    >
      <div className='w-7 h-7 flex items-center'><Icon className={iconColor} strokeWidth={2} /></div>

      <H8 weight="semibold" color={color}>
        {title}
      </H8>
    </Button>
  )
}

export default AdButton
