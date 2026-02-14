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

export const metadata = {
  title: 'Aether',
  description: 'Where Words Float and Find Meaning',
  icons: {
    icon: '/Logo.png',
  },
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

  <script
    dangerouslySetInnerHTML={{
      __html: `
        const originalTitle = document.title;
        document.addEventListener("visibilitychange", function () {
          if (document.hidden) {
            document.title = "come back pls :(";
          } else {
            document.title = originalTitle;
          }
        });
      `,
    }}
  />
</body>

    </html>
  )
}