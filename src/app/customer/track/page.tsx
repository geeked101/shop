'use client'
export const dynamic = 'force-dynamic'
import { Suspense } from 'react'
import TrackContent from './TrackContent'

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-sm text-gray-400">Loading order...</div>}>
      <TrackContent />
    </Suspense>
  )
}
