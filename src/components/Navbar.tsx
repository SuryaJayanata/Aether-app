'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

// SVG Icons Components
const AboutIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const WriteIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
)

const MessagesIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
  </svg>
)


const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const ChevronIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
)

export default function Navbar() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const pathname = usePathname()

  const navItems = [

    { 
      name: 'About', 
      href: '/about', 
      icon: <AboutIcon />, 
      desc: 'Learn about Aether' 
    },
    { 
      name: 'Write', 
      href: '/write', 
      icon: <WriteIcon />, 
      desc: 'Send a message' 
    },
    { 
      name: 'My Messages', 
      href: '/my-messages', 
      icon: <MessagesIcon />, 
      desc: 'Your sent messages' 
    },
  ]

  // Check if current page is active
  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      <header className="flex justify-between items-center py-5 relative">
        <Link href="/" className="font-cinzel text-5xl font-bold text-[var(--primary-blue)] relative inline-block group">
          Aether
          <div className="absolute bottom-[-5px] left-0 w-0 h-0.5 bg-gradient-to-r from-[var(--primary-blue)] to-[var(--accent-blue)] group-hover:w-full transition-all duration-500 ease-out"></div>
          <div className="absolute -bottom-1 left-0 w-full h-px bg-[var(--accent-blue)] opacity-30"></div>
        </Link>
        
        {/* Desktop Navigation dengan underline hover dan active state */}
        <nav className="hidden md:block">
          <ul className="flex space-x-10">
            {navItems.filter(item => item.name !== 'Home').map((item) => {
              const active = isActive(item.href)
              return (
                <li key={item.name}>
                  <Link 
                    href={item.href}
                    className={`text-xl font-semibold relative py-2 transition-all duration-300 ${
                      active 
                        ? 'text-[var(--primary-blue)]' 
                        : 'text-[var(--text-dark)] hover:text-[var(--primary-blue)]'
                    }`}
                  >
                    {item.name}
                    
                    {/* Active underline - selalu tampil jika active */}
                    {active && (
                      <motion.div 
                        className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--primary-blue)] rounded"
                        layoutId="navbar-underline"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30
                        }}
                      />
                    )}
                    
                    {/* Hover underline - hanya tampil saat hover dan tidak active */}
                    {!active && (
                      <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[var(--primary-blue)] to-[var(--accent-blue)] transition-all duration-300 hover:w-full rounded"></div>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Mobile Navigation Toggle */}
        <button 
          className="md:hidden flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--primary-blue)] to-[var(--accent-blue)] shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl group"
          onClick={() => setIsMobileNavOpen(true)}
        >
          <div className="flex flex-col items-center justify-center space-y-1">
            <div className="w-6 h-0.5 bg-white transition-all duration-300 group-hover:rotate-45 group-hover:translate-y-1.5"></div>
            <div className="w-6 h-0.5 bg-white transition-all duration-300 group-hover:opacity-0"></div>
            <div className="w-6 h-0.5 bg-white transition-all duration-300 group-hover:-rotate-45 group-hover:-translate-y-1.5"></div>
          </div>
        </button>
      </header>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileNavOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsMobileNavOpen(false)}
            />
            
            {/* Navigation Panel */}
            <motion.nav
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ 
                type: "spring", 
                damping: 25,
                stiffness: 200
              }}
              className="fixed top-0 right-0 w-80 h-full bg-gradient-to-br from-white via-[var(--soft-blue)] to-[var(--light-blue)] shadow-2xl z-50 md:hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-[var(--accent-blue)]/20">
                <div className="flex items-center justify-between">
                  <div className="font-cinzel text-4xl font-bold text-[var(--primary-blue)]">
                    Aether
                  </div>
                  <button 
                    className="w-10 h-10 rounded-full bg-[var(--light-blue)] flex items-center justify-center hover:bg-[var(--primary-blue)] hover:text-white transition-all duration-300"
                    onClick={() => setIsMobileNavOpen(false)}
                  >
                    <CloseIcon />
                  </button>
                </div>
                <p className="text-sm text-[var(--text-light)] mt-2">
                  Where words find their meaning
                </p>
              </div>

              {/* Navigation Items */}
              <div className="flex-1 p-6 space-y-4">
                {navItems.map((item, index) => {
                  const active = isActive(item.href)
                  return (
                    <motion.div
                      key={item.name}
                      initial={{ x: 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link 
                        href={item.href}
                        className={`flex items-center p-4 rounded-2xl border transition-all duration-300 group relative ${
                          active
                            ? 'bg-[var(--primary-blue)]/10 border-[var(--primary-blue)]/30 shadow-md'
                            : 'bg-white/70 border-white/50 hover:bg-white/90 hover:shadow-md'
                        }`}
                        onClick={() => setIsMobileNavOpen(false)}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 transition-all duration-300 ${
                          active
                            ? 'bg-[var(--primary-blue)] text-white scale-110'
                            : 'bg-gradient-to-br from-[var(--primary-blue)] to-[var(--accent-blue)] text-white group-hover:scale-110'
                        }`}>
                          {item.icon}
                        </div>
                        <div className="flex-1">
                          <div className={`font-semibold transition-colors duration-300 ${
                            active
                              ? 'text-[var(--primary-blue)]'
                              : 'text-[var(--text-dark)] group-hover:text-[var(--primary-blue)]'
                          }`}>
                            {item.name}
                            {active && (
                              <span className="ml-2 text-xs bg-[var(--primary-blue)] text-white px-2 py-1 rounded-full">
                                Active
                              </span>
                            )}
                          </div>
                          <div className={`text-sm transition-colors duration-300 ${
                            active
                              ? 'text-[var(--primary-blue)]/80'
                              : 'text-[var(--text-light)]'
                          }`}>
                            {item.desc}
                          </div>
                        </div>
                        <div className={`transition-all duration-300 ${
                          active
                            ? 'text-[var(--primary-blue)] opacity-100'
                            : 'text-[var(--accent-blue)] opacity-0 group-hover:opacity-100'
                        }`}>
                          <ChevronIcon />
                        </div>
                      </Link>
                    </motion.div>
                  )
                })}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-[var(--accent-blue)]/20">
                <div className="text-center">
                  <div className="font-cinzel text-lg text-[var(--primary-blue)] mb-2">
                    Aether
                  </div>
                  <p className="text-xs text-[var(--text-light)]">
                    Where secret words find their voice
                  </p>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-1/4 -left-4 w-8 h-8 bg-[var(--accent-blue)] rounded-full opacity-20 blur-sm"></div>
              <div className="absolute bottom-1/3 -left-2 w-4 h-4 bg-[var(--primary-blue)] rounded-full opacity-30 blur-sm"></div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  )
}