import React from 'react'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="max-w-[390px] mx-auto bg-white min-h-screen relative shadow-2xl overflow-hidden">
      {children}
    </main>
  )
}
