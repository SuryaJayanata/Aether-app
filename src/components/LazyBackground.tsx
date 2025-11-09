'use client'

import { useEffect, useState } from 'react'

export default function LazyBackground() {
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    // Delay background rendering untuk prioritize content
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 100)
    
    return () => clearTimeout(timer)
  }, [])
  
  if (!isVisible) return null
  
  return (
    <div className="fixed inset-0 -z-10">
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#6ba8d1]/5 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-[#a8d8f0]/8 rounded-full blur-3xl"></div>
    </div>
  )
}