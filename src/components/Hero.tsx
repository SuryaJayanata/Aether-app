'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Hero() {
  return (
    <section className="text-center py-16 relative">
      <motion.h1 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="font-cinzel font-bold text-4xl md:text-5xl mb-6 text-[var(--text-dark)] relative inline-block"
      >
        <motion.span 
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="absolute -left-12 top-1/2 transform -translate-y-1/2 text-3xl text-[var(--primary-pink)] opacity-70 animate-float"
        >
          ♥
        </motion.span>
        Share Your Love with Someone :3
        <motion.span 
          initial={{ scale: 0, rotate: 180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="absolute -right-12 top-1/2 transform -translate-y-1/2 text-3xl text-[var(--primary-pink)] opacity-70 animate-float"
          style={{ animationDelay: '2s' }}
        >
          ♥
        </motion.span>
      </motion.h1>
      
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="text-2xl italic mb-10 text-[var(--text-dark)] opacity-80 max-w-4xl mx-auto leading-relaxed"
      >
        Share your deepest love notes, confessions, and messages.
        <br />
        <motion.span 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-[var(--primary-pink)] font-semibold not-italic mt-2 inline-block gradient-text"
        >
          Your love matters.
        </motion.span>
      </motion.p>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.5, type: "spring", stiffness: 100 }}
      >
        {/* Tombol diubah warna background menjadi gradien Pink Tua */}
        <Link 
          href="/write"
          className="inline-block bg-gradient-to-r from-pink-400 to-pink-300 shadow-lg rounded-full px-12 py-4 text-white text-xl font-semibold font-cinzel transition-all duration-500 border-2 border-pink-400 relative overflow-hidden group hover-lift shine-effect animate-pulse-glow"
          style={{
            boxShadow: '0 0 20px rgba(190, 24, 93, 0.5)' // Shadow pink tua
          }}
        >
          <span className="relative z-10">Write a Note</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        </Link>
      </motion.div>

      {/* Floating decorative elements - Pink & Gold theme */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute -top-10 -left-10 w-20 h-20 bg-[var(--gold)]/10 rounded-full blur-xl animate-float-slow"
      ></motion.div>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute -bottom-5 -right-5 w-16 h-16 bg-[var(--accent-pink)]/20 rounded-full blur-xl animate-float-medium"
      ></motion.div>
    </section>
  )
}