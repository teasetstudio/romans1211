"use client"

import React from 'react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next-nprogress-bar'

const LogoutBtn = () => {
  const router = useRouter()

  const onSignOut = async () => {
    await signOut({ redirect: false })
    router.push('/')
  }
  return (
    <button onClick={onSignOut}>Logout</button>
  )
}

export default LogoutBtn