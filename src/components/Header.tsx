'use client'

import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="bg-navy-800 text-white sticky top-0 z-50 shadow-lg" data-v="2">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-lg bg-iznik-500 flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:bg-iznik-400 transition-colors">
            <svg viewBox="0 0 40 40" className="w-7 h-7" fill="none">
              <circle cx="20" cy="20" r="16" stroke="white" strokeWidth="2" fill="none" />
              <circle cx="20" cy="20" r="8" stroke="white" strokeWidth="1.5" fill="none" />
              <circle cx="20" cy="12" r="2" fill="white" />
              <circle cx="20" cy="28" r="2" fill="white" />
              <circle cx="12" cy="20" r="2" fill="white" />
              <circle cx="28" cy="20" r="2" fill="white" />
              <circle cx="20" cy="20" r="2.5" fill="white" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight tracking-wide">İznikle</h1>
            <p className="text-[10px] text-iznik-300 tracking-widest uppercase">Yerel İşletme Rehberi</p>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/" className="hover:text-iznik-300 transition-colors">Ana Sayfa</Link>
          <Link href="/hakkimizda" className="hover:text-iznik-300 transition-colors">Hakkımızda</Link>
          <Link
            href="/admin/login"
            className="bg-iznik-600 hover:bg-iznik-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Yönetim
          </Link>
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 hover:bg-navy-700 rounded-lg transition-colors"
          aria-label="Menüyü aç/kapat"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <nav className="md:hidden border-t border-navy-700 px-4 py-3 flex flex-col gap-3 text-sm bg-navy-800">
          <Link href="/" onClick={() => setMenuOpen(false)} className="py-2 hover:text-iznik-300">Ana Sayfa</Link>
          <Link href="/hakkimizda" onClick={() => setMenuOpen(false)} className="py-2 hover:text-iznik-300">Hakkımızda</Link>
          <Link
            href="/admin/login"
            onClick={() => setMenuOpen(false)}
            className="bg-iznik-600 hover:bg-iznik-500 px-4 py-2 rounded-lg text-sm font-medium text-center transition-colors"
          >
            Yönetim
          </Link>
        </nav>
      )}
    </header>
  )
}
