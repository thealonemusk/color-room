import '../styles/globals.css'
import { useState, useEffect } from 'react'

export default function App({ Component, pageProps }) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return null
  }

  return <Component {...pageProps} />
}
