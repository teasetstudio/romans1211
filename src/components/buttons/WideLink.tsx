import { Link } from '@/i18n/routing';

import H8 from '@/components/typo/H8'

interface IProps {
  children: string
  link: string
  className?: string
}

const WideLink = ({ children, link, className }: IProps) => (
  <Link href={link}>
    <span className="block group no-underline">
      <H8
        weight="semibold"
        className={`${className} bg-gray3 text-center rounded-xl py-[18px] transition group-hover:bg-gray2 group-active:bg-primary group-active:text-white`}
        color="text-gray1"
      >
        {children}
      </H8>
    </span>
  </Link>
)

export default WideLink
