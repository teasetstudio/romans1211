import React from 'react'

interface Props {
  children: React.ReactNode
  className?: string
}

const BannerWrapper: React.FC<Props> = ({ className = '', children }) => {
  return (
    <div className="container-full">
      <div className={`${className} rounded-2xl sm:rounded-[36px] bg-dark`}>
        <div className="container">{children}</div>
      </div>
    </div>
  )
}

export default BannerWrapper
