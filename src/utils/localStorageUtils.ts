import {
  LOCALSTORAGE_KEY_USER,
} from '@/res/localStorageKeys'

export const getTokenLS = (): string | null => {
  const user = localStorage.getItem(LOCALSTORAGE_KEY_USER)
  return user ? JSON.parse(user).token : null
}
