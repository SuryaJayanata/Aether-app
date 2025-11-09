'use client'

import { motion } from 'framer-motion'
import Navbar from '@/components/Navbar'
import { Mail, Music, Instagram, ExternalLink } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Blobs */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#6ba8d1]/5 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-[#a8d8f0]/8 rounded-full blur-3xl animate-float-medium"></div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl">
        <Navbar />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="my-16"
        >
          {/* Header Section */}
          <div className="text-center mb-16">
            <h1 className="font-cinzel text-5xl font-bold text-[var(--text-dark)] mb-6">
              About Aether
            </h1>
            <p className="text-xl text-[var(--text-light)] max-w-2xl mx-auto leading-relaxed">
              A platform where anonymous messages find their voice, 
              connecting hearts through shared thoughts and emotions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Author Information */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/50 shadow-lg"
            >
              <h2 className="font-cinzel text-3xl font-bold text-[var(--text-dark)] mb-6 text-center">
                About the Creator
              </h2>
              
              {/* Profile Photo */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <img
                    src="/images/pp.png"
                    alt="Surya Jayanata"
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[var(--gold)] rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </div>
              </div> 

              {/* Author Details */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-[var(--text-dark)] mb-2">
                  Surya Jayanata
                </h3>
                <p className="text-[var(--text-light)] mb-4">
                  Frontend Developer & UI UX Enthusiast
                </p>
                <p className="text-sm text-[var(--text-light)] leading-relaxed">
                  Passionate about creating meaningful digital experiences 
                  that connect people through technology and creativity.
                </p>
              </div>

              {/* Social Links */}
              <div className="space-y-4">
                <a
                  href="mailto:sjayanata00@gmail.com"
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-[var(--light-blue)] to-blue-50/50 rounded-xl border border-[var(--accent-blue)]/20 hover:shadow-md transition-all duration-300 group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[var(--primary-blue)] to-[var(--secondary-blue)] rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-[var(--text-dark)]">Email</div>
                      <div className="text-sm text-[var(--text-light)]">sjayanata00@gmail.com</div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-[var(--accent-blue)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </a>

                <a
                  href="https://open.spotify.com/user/314xkbimh6em7evdsgrfy6rhylny?si=6db47730f9a84aa6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-[#1DB954]/10 to-[#1ED760]/5 rounded-xl border border-[#1DB954]/20 hover:shadow-md transition-all duration-300 group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#1DB954] to-[#1ED760] rounded-lg flex items-center justify-center">
                      <Music className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-[var(--text-dark)]">Spotify</div>
                      <div className="text-sm text-[var(--text-light)]">@Surya J</div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-[#1DB954] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </a>

                <a
                  href="https://www.instagram.com/suryajayanata?igsh=ZjJxNmU5anNoemNu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-[#E4405F]/10 to-[#F77737]/5 rounded-xl border border-[#E4405F]/20 hover:shadow-md transition-all duration-300 group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#E4405F] to-[#F77737] rounded-lg flex items-center justify-center">
                      <Instagram className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-[var(--text-dark)]">Instagram</div>
                      <div className="text-sm text-[var(--text-light)]">@suryajayanata</div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-[#E4405F] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </a>
              </div>
            </motion.div>

            {/* Project Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="space-y-6"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/50 shadow-lg">
                <h3 className="font-cinzel text-2xl font-bold text-[var(--text-dark)] mb-4">
                  About Aether Project
                </h3>
                <div className="space-y-4 text-[var(--text-light)] leading-relaxed">
                  <p>
                    Aether is born from the idea that sometimes the most meaningful messages 
                    are those shared anonymously. It's a safe space for:
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-[var(--primary-blue)] rounded-full mt-2 flex-shrink-0"></div>
                      <span>Sharing thoughts without fear of judgment</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-[var(--primary-blue)] rounded-full mt-2 flex-shrink-0"></div>
                      <span>Connecting through shared emotions and experiences</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-[var(--primary-blue)] rounded-full mt-2 flex-shrink-0"></div>
                      <span>Expressing yourself with the power of music</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-[var(--primary-blue)] rounded-full mt-2 flex-shrink-0"></div>
                      <span>Building a community of understanding and support</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/50 shadow-lg">
                <h3 className="font-cinzel text-2xl font-bold text-[var(--text-dark)] mb-4">
                  Technology Stack
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-[var(--primary-blue)] rounded-full"></div>
                    <span className="text-[var(--text-light)]">Next.js 14</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-[var(--primary-blue)] rounded-full"></div>
                    <span className="text-[var(--text-light)]">TypeScript</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-[var(--primary-blue)] rounded-full"></div>
                    <span className="text-[var(--text-light)]">Tailwind CSS</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-[var(--primary-blue)] rounded-full"></div>
                    <span className="text-[var(--text-light)]">Supabase</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-[var(--primary-blue)] rounded-full"></div>
                    <span className="text-[var(--text-light)]">Framer Motion</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-[var(--primary-blue)] rounded-full"></div>
                    <span className="text-[var(--text-light)]">Spotify API</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[var(--primary-blue)]/10 to-[var(--accent-blue)]/5 rounded-2xl p-6 border border-[var(--accent-blue)]/20">
                <h4 className="font-semibold text-[var(--text-dark)] mb-2">Get in Touch</h4>
                <p className="text-sm text-[var(--text-light)] mb-4">
                  Have questions, suggestions, or just want to say hello? 
                  Feel free to reach out through any of the platforms above.
                </p>
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-[var(--primary-blue)] rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-[var(--primary-blue)] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-[var(--primary-blue)] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <footer className="text-center py-12 mt-20 border-t border-[#6ba8d1]/10 relative">
          <div className="absolute top-0 left-1/4 w-1/2 h-px bg-gradient-to-r from-transparent via-[var(--primary-blue)] to-transparent opacity-30"></div>
          <p className="text-[var(--text-light)]">
            Aether &copy; 2025 - Created with 💙 by Surya Jayanata
          </p>
        </footer>
      </div>
    </div>
  )
}