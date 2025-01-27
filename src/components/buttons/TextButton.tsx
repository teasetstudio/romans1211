import { Link } from '@/i18n/routing';
import React from 'react'

type TGeneralProps = {
  children: React.ReactNode
  className?: string
}

type TButton = TGeneralProps & {
  onClick?: () => void
  disabled?: boolean
  href?: never
}

type TLink = TGeneralProps & {
  href: string
  disabled?: boolean
  onClick?: () => void
}

type IProps = TButton | TLink

const TextButton = ({ children, className = '', onClick, href, disabled }: IProps) => (
  <>
    {href ? (
      <Link href={href}>
        <span className={className} onClick={onClick}>{children}</span>
      </Link>
    ) : (
      <button className={className} onClick={onClick} disabled={disabled}>
        {children}
      </button>
    )}
  </>
)

export default TextButton
