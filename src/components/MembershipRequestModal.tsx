'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, Phone, Loader2, CheckCircle } from 'lucide-react'

interface MembershipRequestModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function MembershipRequestModal({ isOpen, onClose }: MembershipRequestModalProps) {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  const isValidPhone = (p: string) => {
    const cleaned = p.replace(/\s/g, '')
    return /^(0[5][0-9]{9}|\+?90[5][0-9]{9})$/.test(cleaned)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!isValidPhone(phone)) {
      setError('Geçerli bir telefon numarası girin. (Örn: 05XX XXX XX XX)')
      return
    }

    setLoading(true)
    const { error: insertError } = await supabase
      .from('membership_requests')
      .insert({ phone: phone.trim() })

    if (insertError) {
      setError('Başvuru gönderilirken bir hata oluştu. Lütfen tekrar deneyin.')
      setLoading(false)
      return
    }

    setLoading(false)
    setSuccess(true)
  }

  const handleClose = () => {
    setPhone('')
    setError('')
    setSuccess(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        {success ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <h3 className="text-lg font-bold text-navy-800 mb-2">Başvurunuz Alındı!</h3>
            <p className="text-sm text-gray-500">
              En kısa sürede sizi arayacağız. Teşekkür ederiz.
            </p>
            <button
              onClick={handleClose}
              className="mt-6 bg-iznik-600 hover:bg-iznik-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              Tamam
            </button>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-iznik-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Phone size={24} className="text-iznik-600" />
              </div>
              <h3 className="text-xl font-bold text-navy-800">Üyelik Başvurusu</h3>
              <p className="text-sm text-gray-500 mt-2">
                Telefon numaranızı girin, en yakın zamanda sizi arayalım.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="05XX XXX XX XX"
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-iznik-500 focus:ring-2 focus:ring-iznik-200 outline-none text-base text-center tracking-wider"
                  autoFocus
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-iznik-600 hover:bg-iznik-700 disabled:bg-iznik-400 text-white font-medium py-3.5 rounded-xl transition-colors text-sm"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Phone size={18} />
                )}
                {loading ? 'Gönderiliyor...' : 'Başvuru Yap'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
