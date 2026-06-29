'use client'

import { useEffect } from 'react'

export function ForceLightMode() {
  useEffect(() => {
    try {
      document.documentElement.classList.remove('dark')
    } catch (e) {
      console.error('Error removing dark class:', e)
    }
  }, [])

  return null
}
