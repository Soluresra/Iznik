'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ImagePlus, X, Loader2, Link as LinkIcon, Crop } from 'lucide-react'
import type { Announcement } from '@/types/database'
import ImageAdjuster from './ImageAdjuster'

interface AnnouncementFormProps {
  announcement?: Announcement | null
  onSave: () => void
  onCancel: () => void
}

export default function AnnouncementForm({ announcement, onSave, onCancel }: AnnouncementFormProps) {
  const [title, setTitle] = useState(announcement?.title || '')
  const [linkUrl, setLinkUrl] = useState(announcement?.link_url || '')
  const [displayOrder, setDisplayOrder] = useState(announcement?.display_order ?? 0)
  const [isActive, setIsActive] = useState(announcement?.is_active ?? true)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(announcement?.image_url || null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showAdjuster, setShowAdjuster] = useState(false)
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const supabase = createClient()

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 20 * 1024 * 1024) {
      setError('Dosya boyutu 20MB\'dan kucuk olmalidir.')
      return
    }

    setError('')

    const reader = new FileReader()
    reader.onload = (ev) => {
      setRawImageSrc(ev.target?.result as string)
      setShowAdjuster(true)
    }
    reader.readAsDataURL(file)
  }

  const handleAdjusterConfirm = (croppedFile: File) => {
    setImageFile(croppedFile)
    const reader = new FileReader()
    reader.onload = (ev) => {
      setImagePreview(ev.target?.result as string)
    }
    reader.readAsDataURL(croppedFile)
    setShowAdjuster(false)
    setRawImageSrc(null)
  }

  const handleAdjusterCancel = () => {
    setShowAdjuster(false)
    setRawImageSrc(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const openAdjusterForExisting = () => {
    if (imagePreview) {
      setRawImageSrc(imagePreview)
      setShowAdjuster(true)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return announcement?.image_url || null

    setUploading(true)
    const ext = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg'
    const fileName = `announcements/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('announcement-images')
      .upload(fileName, imageFile, { cacheControl: '3600', upsert: false })

    if (uploadError) {
      setError('Gorsel yuklenirken hata olustu: ' + uploadError.message)
      setUploading(false)
      return null
    }

    const { data: urlData } = supabase.storage
      .from('announcement-images')
      .getPublicUrl(fileName)

    setUploading(false)
    return urlData.publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!imagePreview) {
      setError('Lutfen bir banner gorseli secin.')
      return
    }

    setSaving(true)

    let imageUrl = announcement?.image_url || null

    if (imageFile) {
      const uploadedUrl = await uploadImage()
      if (!uploadedUrl) {
        setSaving(false)
        return
      }
      imageUrl = uploadedUrl
    }

    const payload = {
      image_url: imageUrl!,
      title: title.trim() || null,
      link_url: linkUrl.trim() || null,
      display_order: displayOrder,
      is_active: isActive,
    }

    if (announcement) {
      const { error: updateError } = await supabase
        .from('announcements')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', announcement.id)

      if (updateError) {
        setError('Guncelleme sirasinda hata olustu.')
        setSaving(false)
        return
      }
    } else {
      const { error: insertError } = await supabase
        .from('announcements')
        .insert(payload)

      if (insertError) {
        setError('Kayit sirasinda hata olustu.')
        setSaving(false)
        return
      }
    }

    setSaving(false)
    onSave()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Gorsel Yukleme */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Banner Görseli <span className="text-red-500">*</span>
        </label>
        {imagePreview ? (
          <div className="relative rounded-xl overflow-hidden border border-gray-200">
            <img
              src={imagePreview}
              alt="Banner onizleme"
              className="w-full h-48 md:h-64 object-cover"
            />
            <div className="absolute top-2 right-2 flex gap-1.5">
              <button
                type="button"
                onClick={openAdjusterForExisting}
                className="w-8 h-8 bg-iznik-600 hover:bg-iznik-700 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                title="Görseli ayarla"
              >
                <Crop size={14} />
              </button>
              <button
                type="button"
                onClick={removeImage}
                className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                title="Görseli kaldır"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 hover:border-iznik-400 rounded-xl p-8 text-center cursor-pointer transition-colors hover:bg-iznik-50/50"
          >
            <ImagePlus size={40} className="mx-auto text-gray-400 mb-3" />
            <p className="text-sm text-gray-500 font-medium">Banner görseli yükleyin</p>
            <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP — Max 20MB</p>
            <p className="text-xs text-gray-400 mt-1">Önerilen boyut: 1920x500 piksel</p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleImageSelect}
          className="hidden"
        />
      </div>

      {/* Baslik */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Başlık <span className="text-gray-400 text-xs">(opsiyonel)</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Banner uzerinde gorunecek baslik"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-iznik-500 focus:ring-2 focus:ring-iznik-200 outline-none text-sm"
        />
      </div>

      {/* Link URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <span className="flex items-center gap-1.5">
            <LinkIcon size={14} />
            Link URL <span className="text-gray-400 text-xs">(opsiyonel)</span>
          </span>
        </label>
        <input
          type="url"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          placeholder="https://..."
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-iznik-500 focus:ring-2 focus:ring-iznik-200 outline-none text-sm"
        />
        <p className="text-xs text-gray-400 mt-1">Tıklandığında yönlendirilecek adres</p>
      </div>

      {/* Siralama ve Aktif/Pasif */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sıralama</label>
          <input
            type="number"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-iznik-500 focus:ring-2 focus:ring-iznik-200 outline-none text-sm"
          />
          <p className="text-xs text-gray-400 mt-1">Kucuk sayilar once gosterilir</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Durum</label>
          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
              isActive
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-gray-50 border-gray-200 text-gray-500'
            }`}
          >
            {isActive ? 'Aktif' : 'Pasif'}
          </button>
        </div>
      </div>

      {/* Hata */}
      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">
          {error}
        </div>
      )}

      {/* Butonlar */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving || uploading}
          className="flex-1 flex items-center justify-center gap-2 bg-iznik-600 hover:bg-iznik-700 disabled:bg-iznik-400 text-white font-medium py-3 rounded-xl transition-colors text-sm"
        >
          {(saving || uploading) && <Loader2 size={18} className="animate-spin" />}
          {uploading ? 'Gorsel yukleniyor...' : saving ? 'Kaydediliyor...' : announcement ? 'Guncelle' : 'Kaydet'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-medium transition-colors"
        >
          İptal
        </button>
      </div>
      {/* Image Adjuster Modal */}
      {showAdjuster && rawImageSrc && (
        <ImageAdjuster
          imageSrc={rawImageSrc}
          onConfirm={handleAdjusterConfirm}
          onCancel={handleAdjusterCancel}
          aspectRatio={16 / 9}
          outputWidth={1920}
        />
      )}
    </form>
  )
}
