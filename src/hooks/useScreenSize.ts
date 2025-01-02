import { useEffect, useState } from 'react'

interface IScreenSizeResponse {
  height: number | null
  width: number | null
}

/**
 * Get screen size
 */
const useScreenSize = (): IScreenSizeResponse => {
  const [screenSize, setScreenSize] = useState<IScreenSizeResponse>({
    height: null,
    width: null,
  })

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({ width: window.innerWidth, height: window.innerHeight })
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return (): void => window.removeEventListener('resize', handleResize)
  }, [])

  return screenSize
}

export default useScreenSize
