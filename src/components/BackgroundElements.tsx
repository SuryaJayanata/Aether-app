'use client'

import { useEffect, useState } from 'react'

const BackgroundElements = () => {
  const [reduceMotion, setReduceMotion] = useState(false)
  const [particleStyles, setParticleStyles] = useState<Array<React.CSSProperties>>([])
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
    
    // Check user's motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduceMotion(mediaQuery.matches)
    
    const handleChange = (e: MediaQueryListEvent) => {
      setReduceMotion(e.matches)
    }
    
    mediaQuery.addEventListener('change', handleChange)
    
    // Generate particle styles hanya di client
    const styles = Array.from({ length: 4 }, (_, i) => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 8}s`,
      animationDuration: `${12 + Math.random() * 8}s`,
    }))
    setParticleStyles(styles)
    
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])
  
  // Jangan render particles di server
  if (!isClient) {
    return (
      <div className="fixed inset-0 -z-10">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#6ba8d1]/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-[#a8d8f0]/8 rounded-full blur-3xl"></div>
      </div>
    )
  }
  
  return (
    <>
      {/* Background Blobs dengan animasi subtle */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div 
          className="absolute -top-24 -left-24 w-96 h-96 bg-[#6ba8d1]/5 rounded-full blur-3xl animate-soft-pulse"
          style={reduceMotion ? { animation: 'none' } : {}}
        ></div>
        <div 
          className="absolute -bottom-24 -right-24 w-80 h-80 bg-[#a8d8f0]/8 rounded-full blur-3xl animate-soft-float"
          style={reduceMotion ? { animation: 'none' } : {}}
        ></div>
      </div>

      {/* Floating Particles - hanya render di client */}
      {!reduceMotion && particleStyles.length > 0 && (
        <div className="fixed inset-0 -z-10 pointer-events-none">
          {particleStyles.map((style, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-[var(--accent-blue)]/40 rounded-full animate-smooth-float"
              style={style}
            />
          ))}
        </div>
      )}
    </>
  )
}

export default BackgroundElements