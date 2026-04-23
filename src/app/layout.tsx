import { Toaster } from 'react-hot-toast'
import { Syne, DM_Sans } from 'next/font/google'
import './globals.css'

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-syne',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-dm-sans',
})

export const metadata = {
  title: 'Shop — Delivered to your door',
  description: 'Order food, groceries and medicine from stores near you in Nairobi',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable}`}>
      <body className="antialiased">
        {children}
        <Toaster position="bottom-center" toastOptions={{ style: { background: '#1a1a2e', color: 'white', borderRadius: '20px', fontSize: '13px' } }} />
      </body>
    </html>
  )
}
