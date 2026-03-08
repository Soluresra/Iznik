'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Category } from '@/types/database'
import { Save, Loader2 } from 'lucide-react'

interface CategoryFormProps {
  category: Category | null
  onSave: () => void
  onCancel: () => void
}

export default function CategoryForm({
  category,
  onSave,
  onCancel,
}: CategoryFormProps) {
  const [form, setForm] = useState({
    name: category?.name || '',
    slug: category?.slug || '',
    icon: category?.icon || '',
    display_order: category?.display_order ?? 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleNameChange = (name: string) => {
    setForm((prev) => ({
      ...prev,
      name,
      slug: category ? prev.slug : generateSlug(name),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.name.trim()) {
      setError('Kategori adı zorunludur.')
      return
    }
    if (!form.slug.trim()) {
      setError('Slug zorunludur.')
      return
    }

    setLoading(true)

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      icon: form.icon.trim() || '📌',
      display_order: form.display_order,
    }

    if (category) {
      const { error: err } = await supabase
        .from('categories')
        .update(payload)
        .eq('id', category.id)
      if (err) {
        setError('Güncelleme sırasında bir hata oluştu.')
        setLoading(false)
        return
      }
    } else {
      const { error: err } = await supabase.from('categories').insert(payload)
      if (err) {
        setError('Ekleme sırasında bir hata oluştu. Slug benzersiz olmalıdır.')
        setLoading(false)
        return
      }
    }

    setLoading(false)
    onSave()
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
      {/* Kategori Adı */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Kategori Adı <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => handleNameChange(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-iznik-500 focus:ring-2 focus:ring-iznik-200 outline-none text-sm"
          placeholder="Ör: Çini Sanatçıları"
        />
      </div>

      {/* Slug */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Slug <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.slug}
          onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-iznik-500 focus:ring-2 focus:ring-iznik-200 outline-none text-sm"
          placeholder="cini-sanatcilari"
        />
        <p className="text-xs text-gray-400 mt-1">URL&apos;de kullanılacak benzersiz tanımlayıcı.</p>
      </div>

      {/* İkon & Sıralama */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">İkon (Emoji)</label>
          <input
            type="text"
            value={form.icon}
            onChange={(e) => setForm((prev) => ({ ...prev, icon: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-iznik-500 focus:ring-2 focus:ring-iznik-200 outline-none text-sm"
            placeholder="🎨"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sıralama</label>
          <input
            type="number"
            value={form.display_order}
            onChange={(e) => setForm((prev) => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-iznik-500 focus:ring-2 focus:ring-iznik-200 outline-none text-sm"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 bg-iznik-600 hover:bg-iznik-700 disabled:bg-iznik-400 text-white font-medium py-3 rounded-xl transition-colors text-sm"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {loading ? 'Kaydediliyor...' : category ? 'Güncelle' : 'Ekle'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-medium transition-colors"
        >
          İptal
        </button>
      </div>
    </form>
  )
}
