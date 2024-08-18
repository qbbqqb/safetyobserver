'use client'

import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-blue-600 text-white p-4">
      <nav className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          SafetyObserver
        </Link>
        <div>
          <Link href="/report" className="mr-4 hover:underline">
            Report Observation
          </Link>
          <Link href="/dashboard" className="hover:underline">
            Dashboard
          </Link>
        </div>
      </nav>
    </header>
  )
}
