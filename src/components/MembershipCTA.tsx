'use client'

import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import MembershipRequestModal from './MembershipRequestModal'

export default function MembershipCTA() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <section className="bg-gradient-to-r from-iznik-600 via-iznik-700 to-navy-700 py-10 md:py-14 relative overflow-hidden">
        {/* Dekoratif motif */}
        <svg className="absolute right-6 top-1/2 -translate-y-1/2 w-36 h-36 opacity-[0.06] pointer-events-none hidden md:block" viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="90" stroke="white" strokeWidth="2"/>
          <circle cx="100" cy="100" r="60" stroke="white" strokeWidth="1.5"/>
          <circle cx="100" cy="100" r="30" stroke="white" strokeWidth="1"/>
          <circle cx="100" cy="100" r="8" fill="white"/>
        </svg>

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-3">
            Siz de bu platformda yer almak ister misiniz?
          </h2>
          <p className="text-iznik-100 text-sm md:text-base mb-6 max-w-xl mx-auto">
            Kayıt veya duyuru yayınlamak için bize ulaşın.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 bg-white text-iznik-700 hover:bg-iznik-50 px-6 py-3 rounded-xl text-sm font-semibold transition-colors shadow-lg hover:shadow-xl"
          >
            <UserPlus size={18} />
            Başvuru İçin Tıklayın
          </button>
        </div>
      </section>

      <MembershipRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}
