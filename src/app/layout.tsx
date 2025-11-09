import type { Metadata } from 'next'
import { Inter, Cinzel } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter'
})

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel'
})

export const metadata: Metadata = {
  title: 'Aether - Where Words Float and Find Meaning',
  description: 'Share your deepest thoughts, confessions, and messages anonymously',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${cinzel.variable} font-sans`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}