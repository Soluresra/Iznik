'use client'

import { Search, X } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative w-full max-w-xl mx-auto">
      <Search
        size={20}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-iznik-500"
      />
      <input
        type="text"
        placeholder="İşletme veya kategori ara..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-12 pr-10 py-3.5 rounded-xl border-2 border-gray-200 focus:border-iznik-500 focus:ring-2 focus:ring-iznik-200 outline-none transition-all text-sm bg-white shadow-sm"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          aria-label="Aramayı temizle"
        >
          <X size={18} />
        </button>
      )}
    </div>
  )
}
