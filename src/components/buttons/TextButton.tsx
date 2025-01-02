import Link from 'next/link'
import React from 'react'

type TGeneralProps = {
  children: React.ReactNode
  className?: string
}

type TButton = TGeneralProps & {
  onClick?: () => void
  href?: never
}

type TLink = TGeneralProps & {
  href: string
  onClick?: () => void
}

type IProps = TButton | TLink

const TextButton = ({ children, className = '', onClick, href }: IProps) => (
  <>
    {href ? (
      <Link href={href}>
        <span className={className} onClick={onClick}>{children}</span>
      </Link>
    ) : (
      <button className={className} onClick={onClick}>
        {children}
      </button>
    )}
  </>
)

export default TextButton
