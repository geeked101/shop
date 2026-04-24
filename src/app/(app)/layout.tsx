import React from 'react'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="w-full max-w-md mx-auto bg-white min-h-screen relative shadow-[0_0_50px_rgba(0,0,0,0.1)] overflow-x-hidden md:border-x md:border-gray-50 flex flex-col">
      <div className="flex-1 flex flex-col w-full h-full">
        {children}
      </div>
    </main>
  )
}
