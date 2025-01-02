'use client'

import { Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'

interface ProvidersProps {
  children: React.ReactNode
  session: Session | null
}

export function ClientSessionProvider({ children, session }: ProvidersProps) {
  return <SessionProvider session={session} refetchOnWindowFocus={false}>{children}</SessionProvider>
}
