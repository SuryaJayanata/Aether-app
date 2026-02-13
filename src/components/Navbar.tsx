'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart } from 'lucide-react'

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
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 012 2h-5l-5 5v-5z" />
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

  // Navigation Items - English
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

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Compact Navbar: Added 'py-3' instead of 'py-5' */}
      <header className="flex justify-between items-center py-3 relative border-b border-pink-100 mb-8">
        
        {/* Logo, Valentine Edition, and Heart */}
        <Link href="/" className="flex flex-col group relative">
          <div className="flex items-center gap-1">
            <span className="font-cinzel text-4xl font-bold text-pink-700 tracking-tighter">
              Aether
            </span>
            <Heart className="w-5 h-5 text-red-500 fill-red-500 rotate-12" />
          </div>
          <span className="text-[10px] font-semibold text-pink-600 tracking-widest uppercase ml-1 mt-0">
            Valentine Edition
          </span>
          <div className="absolute bottom-[-5px] left-0 w-0 h-0.5 bg-gradient-to-r from-pink-500 to-red-400 group-hover:w-full transition-all duration-500 ease-out"></div>
        </Link>
        
        {/* Desktop Navigation - font-sans for clean look, text-lg for smaller size */}
        <nav className="hidden md:block">
          <ul className="flex space-x-6">
            {navItems.map((item) => {
              const active = isActive(item.href)
              return (
                <li key={item.name}>
                  <Link 
                    href={item.href}
                    className={`text-lg font-medium relative py-1 transition-all duration-300 font-sans ${
                      active 
                        ? 'text-pink-600' 
                        : 'text-gray-800 hover:text-pink-500'
                    }`}
                  >
                    {item.name}
                    
                    {/* Active underline - Valentine Red */}
                    {active && (
                      <motion.div 
                        className="absolute bottom-0 left-0 w-full h-0.5 bg-red-400 rounded"
                        layoutId="navbar-underline"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30
                        }}
                      />
                    )}
                    
                    {/* Hover underline - Valentine Gradient */}
                    {!active && (
                      <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-pink-400 to-red-400 transition-all duration-300 hover:w-full rounded"></div>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Mobile Navigation Toggle - Compact size */}
        <button 
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-red-500 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl group"
          onClick={() => setIsMobileNavOpen(true)}
        >
          <div className="flex flex-col items-center justify-center space-y-1">
            <div className="w-5 h-0.5 bg-white transition-all duration-300 group-hover:rotate-45 group-hover:translate-y-1.5"></div>
            <div className="w-5 h-0.5 bg-white transition-all duration-300 group-hover:opacity-0"></div>
            <div className="w-5 h-0.5 bg-white transition-all duration-300 group-hover:-rotate-45 group-hover:-translate-y-1.5"></div>
          </div>
        </button>
      </header>

      {/* Mobile Navigation - Remains the same, updated text */}
      <AnimatePresence>
        {isMobileNavOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsMobileNavOpen(false)}
            />
            
            <motion.nav
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ 
                type: "spring", 
                damping: 25,
                stiffness: 200
              }}
              className="fixed top-0 right-0 w-72 h-full bg-gradient-to-br from-white via-rose-50 to-pink-100 shadow-2xl z-50 md:hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-5 border-b border-pink-200">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <div className="font-cinzel text-3xl font-bold text-pink-700 flex items-center gap-2">
                      Aether
                      <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                    </div>
                    <span className="text-[10px] font-semibold text-pink-600 tracking-widest uppercase ml-1">
                      Valentine Edition
                    </span>
                  </div>
                  <button 
                    className="w-9 h-9 rounded-full bg-pink-100 flex items-center justify-center hover:bg-red-400 hover:text-white transition-all duration-300"
                    onClick={() => setIsMobileNavOpen(false)}
                  >
                    <CloseIcon />
                  </button>
                </div>
                <p className="text-sm text-pink-600 mt-2">
                  Sending love through the ether
                </p>
              </div>

              {/* Navigation Items */}
              <div className="flex-1 p-5 space-y-3">
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
                        className={`flex items-center p-3 rounded-xl border transition-all duration-300 group relative ${
                          active
                            ? 'bg-pink-100 border-pink-300 shadow-md'
                            : 'bg-white/70 border-white/50 hover:bg-white/90 hover:shadow-md'
                        }`}
                        onClick={() => setIsMobileNavOpen(false)}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 transition-all duration-300 ${
                          active
                            ? 'bg-red-500 text-white scale-105'
                            : 'bg-gradient-to-br from-pink-400 to-red-400 text-white group-hover:scale-105'
                        }`}>
                          {item.icon}
                        </div>
                        <div className="flex-1">
                          <div className={`font-semibold transition-colors duration-300 ${
                            active
                              ? 'text-red-700'
                              : 'text-gray-800 group-hover:text-red-600'
                          }`}>
                            {item.name}
                            {active && (
                              <span className="ml-2 text-xs bg-red-400 text-white px-2 py-0.5 rounded-full">
                                Active
                              </span>
                            )}
                          </div>
                          <div className={`text-xs transition-colors duration-300 ${
                            active
                              ? 'text-pink-700'
                              : 'text-gray-500'
                          }`}>
                            {item.desc}
                          </div>
                        </div>
                        <div className={`transition-all duration-300 ${
                          active
                            ? 'text-red-500 opacity-100'
                            : 'text-pink-400 opacity-0 group-hover:opacity-100'
                        }`}>
                          <ChevronIcon />
                        </div>
                      </Link>
                    </motion.div>
                  )
                })}
              </div>

              {/* Footer */}
              <div className="p-5 border-t border-pink-200">
                <div className="text-center">
                  <div className="font-cinzel text-lg text-pink-700 mb-1">
                    Aether
                  </div>
                  <p className="text-xs text-pink-600">
                    Made with 💖 for special moments
                  </p>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-1/4 -left-4 w-8 h-8 bg-red-200 rounded-full opacity-30 blur-sm"></div>
              <div className="absolute bottom-1/3 -left-2 w-4 h-4 bg-pink-200 rounded-full opacity-40 blur-sm"></div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  )
}