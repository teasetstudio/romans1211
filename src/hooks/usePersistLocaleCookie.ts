import { useRouter } from 'next/router'
import { useEffect } from 'react'

const usePersistLocaleCookie = () => {
  const { locale } = useRouter()

  useEffect(persistLocaleCookie, [locale])
  function persistLocaleCookie() {
    const date = new Date()
    const expireMs = 365 * 24 * 60 * 60 * 1000 // 1 year
    date.setTime(date.getTime() + expireMs)
    document.cookie = `NEXT_LOCALE=${locale};expires=${date.toUTCString()};path=/`
  }
}

export default usePersistLocaleCookie
