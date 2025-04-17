import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Howzat',
  description: 'Howzat - The Cricket Scoreboard',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
