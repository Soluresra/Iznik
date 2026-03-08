'use client'

import { Phone, MessageCircle, Instagram, MapPin } from 'lucide-react'
import type { BusinessWithCategory } from '@/types/database'

interface BusinessCardProps {
  business: BusinessWithCategory
}

export default function BusinessCard({ business }: BusinessCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-iznik-200 transition-all duration-300 overflow-hidden group">
      {/* Category badge & image area */}
      <div className="relative h-36 bg-gradient-to-br from-iznik-500 to-navy-600 flex items-center justify-center">
        {business.image_url ? (
          <img
            src={business.image_url}
            alt={business.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-5xl opacity-80">
            {business.categories?.icon || '🏪'}
          </span>
        )}
        {business.categories && (
          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-navy-700 text-xs font-medium px-3 py-1 rounded-full shadow-sm">
            {business.categories.icon} {business.categories.name}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-bold text-lg text-navy-800 group-hover:text-iznik-700 transition-colors">
          {business.name}
        </h3>

        {business.description && (
          <p className="text-gray-500 text-sm mt-1.5 line-clamp-2 leading-relaxed">
            {business.description}
          </p>
        )}

        {business.address && (
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(business.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 mt-3 text-xs text-gray-400 hover:text-iznik-600 transition-colors cursor-pointer group/addr"
          >
            <MapPin size={13} />
            <span className="underline-offset-2 group-hover/addr:underline">{business.address}</span>
          </a>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
          {business.whatsapp && (
            <a
              href={`https://wa.me/${business.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-medium px-3.5 py-2 rounded-lg transition-colors"
            >
              <MessageCircle size={14} />
              WhatsApp
            </a>
          )}
          {business.phone && (
            <a
              href={`tel:${business.phone}`}
              className="flex items-center gap-1.5 bg-iznik-600 hover:bg-iznik-700 text-white text-xs font-medium px-3.5 py-2 rounded-lg transition-colors"
            >
              <Phone size={14} />
              Ara
            </a>
          )}
          {business.instagram && (
            <a
              href={`https://instagram.com/${business.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-xs font-medium px-3.5 py-2 rounded-lg transition-colors"
            >
              <Instagram size={14} />
              Instagram
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
