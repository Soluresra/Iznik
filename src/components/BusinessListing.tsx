'use client'

import { useState, useMemo } from 'react'
import type { Category, BusinessWithCategory } from '@/types/database'
import SearchBar from './SearchBar'
import CategoryFilter from './CategoryFilter'
import BusinessCard from './BusinessCard'

interface BusinessListingProps {
  initialCategories: Category[]
  initialBusinesses: BusinessWithCategory[]
}

export default function BusinessListing({
  initialCategories,
  initialBusinesses,
}: BusinessListingProps) {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Client-side filtreleme: isim, açıklama, tags ve kategori üzerinden
  const filteredBusinesses = useMemo(() => {
    const term = search.trim().toLowerCase()

    return initialBusinesses.filter((b) => {
      // Kategori filtresi
      if (selectedCategory) {
        const cat = initialCategories.find((c) => c.slug === selectedCategory)
        if (cat && b.category_id !== cat.id) return false
      }

      // Arama filtresi: isim + açıklama + tags
      if (term) {
        const nameMatch = b.name.toLowerCase().includes(term)
        const descMatch = b.description?.toLowerCase().includes(term) ?? false
        const tagMatch = Array.isArray(b.tags)
          && b.tags.some((tag) => tag.toLowerCase().includes(term))
        if (!nameMatch && !descMatch && !tagMatch) return false
      }

      return true
    })
  }, [search, selectedCategory, initialBusinesses, initialCategories])

  return (
    <section className="max-w-6xl mx-auto px-4">
      {/* Search */}
      <div className="mb-8">
        <SearchBar value={search} onChange={setSearch} />
      </div>

      {/* Category Filter */}
      <div className="mb-10">
        <CategoryFilter
          categories={initialCategories}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">
          <span className="font-semibold text-navy-700">{filteredBusinesses.length}</span> işletme bulundu
        </p>
        {(search || selectedCategory) && (
          <button
            onClick={() => { setSearch(''); setSelectedCategory(null) }}
            className="text-xs text-iznik-600 hover:text-iznik-800 font-medium"
          >
            Filtreleri temizle
          </button>
        )}
      </div>

      {/* Business grid */}
      {filteredBusinesses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBusinesses.map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-gray-500 text-lg">Sonuç bulunamadı</p>
          <p className="text-gray-400 text-sm mt-1">Farklı bir arama terimi veya kategori deneyin.</p>
        </div>
      )}
    </section>
  )
}
