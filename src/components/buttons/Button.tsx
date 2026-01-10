import { ProgressLink as Link } from '@/components/buttons/ProgressLink';
import React, { ReactNode } from 'react'

import { TBGColors } from '@/types/ColorType'

enum WidthSizes {
  lg = 'min-w-[286px]',
  sm = 'min-w-[156px]',
  md = 'min-w-[197px]',
}

interface IButton {
  title?: string
  type?: 'button' | 'reset' | 'submit'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onClick?: (arg?: any) => void
  href?: string
  className?: string
  size?: 'lg' | 'md' | 'sm'
  rounded?: 'rounded-md' | 'rounded-xl' | 'rounded-lg'
  bgColor?: TBGColors
  paddingClass?: 'py-5' | string
  children?: ReactNode;
  disabled?: boolean
}

const Button: React.FC<IButton> = ({
  children,
  bgColor = '',
  className = '',
  size,
  rounded = 'rounded-xl',
  title,
  type = 'button',
  onClick,
  href,
  paddingClass = 'py-4',
  disabled,
}) => {
  const classes = `${className} filter transition hover:invert-[.15] active:brightness-75 ${size && WidthSizes[size]
    } ${bgColor} ${rounded} ${paddingClass}`

  return (
    <>
      {!href && (
        <button onClick={onClick} type={type} className={`${classes}`} disabled={disabled}>
          {title || children}
        </button>
      )}
      {href && (
        <Link href={href}>
          <span className={`${classes} text-center block`}>{title || children}</span>
        </Link>
      )}
    </>
  )
}

export default Button
