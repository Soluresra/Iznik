'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Category, BusinessWithCategory } from '@/types/database'
import { Save, Loader2, X, CalendarDays, Upload } from 'lucide-react'

interface BusinessFormProps {
  categories: Category[]
  business: BusinessWithCategory | null
  onSave: () => void
  onCancel: () => void
}

export default function BusinessForm({
  categories,
  business,
  onSave,
  onCancel,
}: BusinessFormProps) {
  const [form, setForm] = useState({
    name: business?.name || '',
    description: business?.description || '',
    category_id: business?.category_id || '',
    phone: business?.phone || '',
    whatsapp: business?.whatsapp || '',
    instagram: business?.instagram || '',
    address: business?.address || '',
    image_url: business?.image_url || '',
    tags: business?.tags || [],
    is_active: business?.is_active ?? true,
    valid_from: business?.valid_from || '',
    valid_until: business?.valid_until || '',
  })
  const [tagInput, setTagInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(business?.image_url || null)
  const [uploading, setUploading] = useState(false)

  const [todayStr, setTodayStr] = useState('')

  useEffect(() => {
    const t = new Date().toISOString().split('T')[0]
    setTodayStr(t)
    if (!form.valid_from) {
      setForm((prev) => ({ ...prev, valid_from: t }))
    }
  }, [])

  const supabase = createClient()

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError('Görsel boyutu en fazla 5MB olabilir.')
      return
    }

    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return form.image_url.trim() || null

    setUploading(true)
    const fileExt = imageFile.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`
    const filePath = `businesses/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('business-images')
      .upload(filePath, imageFile)

    if (uploadError) {
      setError('Görsel yüklenirken bir hata oluştu: ' + uploadError.message)
      setUploading(false)
      return null
    }

    const { data: { publicUrl } } = supabase.storage
      .from('business-images')
      .getPublicUrl(filePath)

    setUploading(false)
    return publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.name.trim()) {
      setError('İşletme adı zorunludur.')
      return
    }

    setLoading(true)

    const imageUrl = await uploadImage()
    if (imageFile && imageUrl === null) {
      setLoading(false)
      return
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      category_id: form.category_id || null,
      phone: form.phone.trim() || null,
      whatsapp: form.whatsapp.trim() || null,
      instagram: form.instagram.trim() || null,
      address: form.address.trim() || null,
      image_url: imageUrl,
      tags: form.tags,
      is_active: form.is_active,
      valid_from: form.valid_from || null,
      valid_until: form.valid_until || null,
    }

    if (business) {
      const { error: err } = await supabase
        .from('businesses')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', business.id)
      if (err) {
        setError('Güncelleme sırasında bir hata oluştu.')
        setLoading(false)
        return
      }
    } else {
      const { error: err } = await supabase.from('businesses').insert(payload)
      if (err) {
        setError('Ekleme sırasında bir hata oluştu.')
        setLoading(false)
        return
      }
    }

    setLoading(false)
    onSave()
  }

  const updateField = (field: string, value: string | boolean | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
      {/* İşletme Adı */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          İşletme Adı <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => updateField('name', e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-iznik-500 focus:ring-2 focus:ring-iznik-200 outline-none text-sm"
          placeholder="Ör: Usta Çini Atölyesi"
        />
      </div>

      {/* Açıklama */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
        <textarea
          value={form.description}
          onChange={(e) => updateField('description', e.target.value)}
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-iznik-500 focus:ring-2 focus:ring-iznik-200 outline-none text-sm resize-none"
          placeholder="İşletme hakkında kısa bir açıklama..."
        />
      </div>

      {/* Kategori */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
        <select
          value={form.category_id}
          onChange={(e) => updateField('category_id', e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-iznik-500 focus:ring-2 focus:ring-iznik-200 outline-none text-sm bg-white"
        >
          <option value="">Kategori seçin</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.icon} {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Telefon & WhatsApp */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
          <input
            type="text"
            value={form.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-iznik-500 focus:ring-2 focus:ring-iznik-200 outline-none text-sm"
            placeholder="05XX XXX XX XX"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
          <input
            type="text"
            value={form.whatsapp}
            onChange={(e) => updateField('whatsapp', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-iznik-500 focus:ring-2 focus:ring-iznik-200 outline-none text-sm"
            placeholder="905XXXXXXXXX"
          />
        </div>
      </div>

      {/* Instagram & Adres */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
          <input
            type="text"
            value={form.instagram}
            onChange={(e) => updateField('instagram', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-iznik-500 focus:ring-2 focus:ring-iznik-200 outline-none text-sm"
            placeholder="kullanici_adi"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => updateField('address', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-iznik-500 focus:ring-2 focus:ring-iznik-200 outline-none text-sm"
            placeholder="Mahalle, İznik"
          />
        </div>
      </div>

      {/* Görsel Yükleme */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Görsel</label>

        {imagePreview && (
          <div className="relative mb-3">
            <img
              src={imagePreview}
              alt="Önizleme"
              className="w-full h-40 object-cover rounded-xl border border-gray-200"
            />
            <button
              type="button"
              onClick={() => {
                setImageFile(null)
                setImagePreview(null)
                updateField('image_url', '')
              }}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-lg transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        )}

        <label className="flex items-center justify-center gap-2 w-full px-4 py-4 rounded-xl border-2 border-dashed border-gray-300 hover:border-iznik-500 cursor-pointer transition-colors text-sm text-gray-500 hover:text-iznik-600">
          <Upload size={18} />
          {uploading ? 'Yükleniyor...' : imageFile ? imageFile.name : 'Görsel yüklemek için tıklayın'}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageSelect}
            className="hidden"
          />
        </label>
        <p className="text-xs text-gray-400 mt-1">JPEG, PNG veya WebP. Maksimum 5MB.</p>
      </div>

      {/* Anahtar Kelimeler (Tags) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Anahtar Kelimeler
        </label>
        <p className="text-xs text-gray-400 mb-2">
          Aramalarda eşleşecek kelimeler (ör: zeytinyağı, seramik, tamir). Enter veya virgül ile ekleyin.
        </p>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {form.tags.map((tag, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 bg-iznik-50 text-iznik-700 text-xs font-medium px-2.5 py-1 rounded-lg border border-iznik-200"
            >
              {tag}
              <button
                type="button"
                onClick={() => setForm((prev) => ({
                  ...prev,
                  tags: prev.tags.filter((_, idx) => idx !== i),
                }))}
                className="text-iznik-400 hover:text-iznik-700"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault()
              const val = tagInput.trim().replace(/,/g, '')
              if (val && !form.tags.includes(val)) {
                setForm((prev) => ({ ...prev, tags: [...prev.tags, val] }))
              }
              setTagInput('')
            }
          }}
          onBlur={() => {
            const val = tagInput.trim().replace(/,/g, '')
            if (val && !form.tags.includes(val)) {
              setForm((prev) => ({ ...prev, tags: [...prev.tags, val] }))
            }
            setTagInput('')
          }}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-iznik-500 focus:ring-2 focus:ring-iznik-200 outline-none text-sm"
          placeholder="Bir kelime yazıp Enter'a basın..."
        />
      </div>

      {/* Geçerlilik Tarihleri */}
      <div className="border border-gray-200 rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <CalendarDays size={16} className="text-iznik-600" />
          Geçerlilik Süresi
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Başlangıç Tarihi</label>
            <input
              type="date"
              value={form.valid_from}
              onChange={(e) => updateField('valid_from', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-iznik-500 focus:ring-2 focus:ring-iznik-200 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Bitiş Tarihi</label>
            <input
              type="date"
              value={form.valid_until}
              onChange={(e) => updateField('valid_until', e.target.value)}
              min={form.valid_from || undefined}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-iznik-500 focus:ring-2 focus:ring-iznik-200 outline-none text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">
              {form.valid_until ? `Bitiş: ${new Date(form.valid_until).toLocaleDateString('tr-TR')}` : 'Boş bırakılırsa süresiz aktif kalır'}
            </p>
          </div>
        </div>
        {form.valid_until && todayStr && form.valid_until < todayStr && (
          <div className="bg-amber-50 text-amber-700 text-xs px-3 py-2 rounded-lg border border-amber-200">
            ⚠️ Bitiş tarihi geçmiş. İşletme anasayfada görünmeyecek.
          </div>
        )}
      </div>

      {/* Aktif/Pasif */}
      <div className="flex items-center gap-3">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => updateField('is_active', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-iznik-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-iznik-600" />
        </label>
        <span className="text-sm text-gray-700">
          {form.is_active ? 'Aktif (sitede görünür)' : 'Pasif (sitede görünmez)'}
        </span>
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
          {loading ? 'Kaydediliyor...' : business ? 'Güncelle' : 'Ekle'}
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
