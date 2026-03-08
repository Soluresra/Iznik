'use client'

import type { Category } from '@/types/database'

interface CategoryFilterProps {
  categories: Category[]
  selected: string | null
  onSelect: (slug: string | null) => void
}

export default function CategoryFilter({ categories, selected, onSelect }: CategoryFilterProps) {
  return (
    <div id="kategoriler" className="flex flex-wrap gap-2 justify-center">
      <button
        onClick={() => onSelect(null)}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
          selected === null
            ? 'bg-iznik-600 text-white shadow-md'
            : 'bg-white text-gray-600 border border-gray-200 hover:border-iznik-300 hover:text-iznik-700'
        }`}
      >
        Tümü
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.slug === selected ? null : cat.slug)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            selected === cat.slug
              ? 'bg-iznik-600 text-white shadow-md'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-iznik-300 hover:text-iznik-700'
          }`}
        >
          <span className="mr-1.5">{cat.icon}</span>
          {cat.name}
        </button>
      ))}
    </div>
  )
}
