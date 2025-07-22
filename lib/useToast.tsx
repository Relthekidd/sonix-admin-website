'use client'
import { useState, useCallback } from 'react'

export function useToast() {
  const [message, setMessage] = useState<string | null>(null)

  const show = useCallback((msg: string, duration = 3000) => {
    setMessage(msg)
    setTimeout(() => setMessage(null), duration)
  }, [])

  const Toast = () =>
    message ? (
      <div className="fixed bottom-safe left-1/2 -translate-x-1/2 bg-black text-white px-4 py-2 rounded z-50">
        {message}
      </div>
    ) : null

  return { show, Toast }
}
