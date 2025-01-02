import React from 'react'

import { IUser } from '@/types/User'

export interface IAuthContent {
  user: IUser | null
  setUser: (c: IUser) => void
  removeUser: () => void
}

const AuthContext = React.createContext<IAuthContent>({
  user: null,
  setUser: () => null,
  removeUser: () => null,
})

export default AuthContext
