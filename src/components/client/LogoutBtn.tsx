"use client"

import React from 'react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next-nprogress-bar'
import { IconLogout } from '@/res/icons'


interface IProps {
  showOnlyIcon?: boolean
}

const LogoutBtn = ({ showOnlyIcon }: IProps) => {
  const router = useRouter()

  const onSignOut = async () => {
    await signOut({ redirect: false })
    router.push('/')
  }
  
  return (
    <button
      onClick={onSignOut}
      className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white 
        bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800"
    >
      <IconLogout />

      {showOnlyIcon ? null : 'Sign Out'}
    </button>
  )
}

export default LogoutBtn