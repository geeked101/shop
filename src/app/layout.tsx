import type { Metadata } from 'next'

import { Toaster } from 'react-hot-toast'
import './globals.css'



export const metadata: Metadata = {
  title: 'Shop — Delivered to your door',
  description: 'Order food, groceries and medicine from stores near you in Nairobi',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans">
        <main className="max-w-[390px] mx-auto bg-white min-h-screen relative">
          {children}
        </main>
        <Toaster position="bottom-center" toastOptions={{ style: { background: '#1a1a2e', color: 'white', borderRadius: '20px', fontSize: '13px' } }} />
      </body>
    </html>
  )
}
