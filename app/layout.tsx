import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter ({ subsets: ['latin']})

export const metadata = {
  title: 'Auth App',
  description: 'A simple authentication app using Next.js and Supabase',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
