'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Category, BusinessWithCategory, MembershipRequest, Announcement } from '@/types/database'
import BusinessForm from './BusinessForm'
import CategoryForm from './CategoryForm'
import AnnouncementForm from './AnnouncementForm'
import {
  LogOut,
  Plus,
  Pencil,
  Trash2,
  Search,
  LayoutDashboard,
  Store,
  FolderOpen,
  ChevronLeft,
  CalendarDays,
  AlertTriangle,
  UserPlus,
  Phone,
  CheckCircle2,
  Megaphone,
  Eye,
  EyeOff,
} from 'lucide-react'
import Link from 'next/link'

interface AdminDashboardProps {
  categories: Category[]
  initialBusinesses: BusinessWithCategory[]
  initialRequests: MembershipRequest[]
  initialAnnouncements: Announcement[]
  userEmail: string
}

type ActiveTab = 'businesses' | 'categories' | 'requests' | 'announcements'

export default function AdminDashboard({
  categories: initialCategories,
  initialBusinesses,
  initialRequests,
  initialAnnouncements,
  userEmail,
}: AdminDashboardProps) {
  const [businesses, setBusinesses] = useState(initialBusinesses)
  const [categories, setCategories] = useState(initialCategories)
  const [requests, setRequests] = useState(initialRequests)
  const [announcements, setAnnouncements] = useState(initialAnnouncements)
  const [activeTab, setActiveTab] = useState<ActiveTab>('businesses')
  const [editingBusiness, setEditingBusiness] = useState<BusinessWithCategory | null>(null)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)
  const [showBusinessForm, setShowBusinessForm] = useState(false)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [today, setToday] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    setToday(new Date().toISOString().split('T')[0])
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  // Business handlers
  const handleDeleteBusiness = async (id: string) => {
    if (!confirm('Bu işletmeyi silmek istediğinizden emin misiniz?')) return
    setDeleting(id)
    await supabase.from('businesses').delete().eq('id', id)
    setBusinesses((prev) => prev.filter((b) => b.id !== id))
    setDeleting(null)
  }

  const handleSaveBusiness = async () => {
    setShowBusinessForm(false)
    setEditingBusiness(null)
    const { data } = await supabase
      .from('businesses')
      .select('*, categories(*)')
      .order('created_at', { ascending: false })
    if (data) setBusinesses(data as BusinessWithCategory[])
  }

  // Category handlers
  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Bu kategoriyi silmek istediğinizden emin misiniz? İlişkili işletmelerin kategorisi boşalacaktır.')) return
    setDeleting(id)
    await supabase.from('categories').delete().eq('id', id)
    setCategories((prev) => prev.filter((c) => c.id !== id))
    setDeleting(null)
  }

  const handleSaveCategory = async () => {
    setShowCategoryForm(false)
    setEditingCategory(null)
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('display_order')
    if (data) setCategories(data as Category[])
  }

  // Request handlers
  const handleUpdateRequestStatus = async (id: string, status: string) => {
    const { error: err } = await supabase
      .from('membership_requests')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (!err) {
      setRequests((prev) =>
        prev.map((r) => r.id === id ? { ...r, status: status as MembershipRequest['status'], updated_at: new Date().toISOString() } : r)
      )
    }
  }

  const handleDeleteRequest = async (id: string) => {
    if (!confirm('Bu başvuruyu silmek istediğinizden emin misiniz?')) return
    setDeleting(id)
    await supabase.from('membership_requests').delete().eq('id', id)
    setRequests((prev) => prev.filter((r) => r.id !== id))
    setDeleting(null)
  }

  // Announcement handlers
  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm('Bu duyuruyu silmek istediğinizden emin misiniz?')) return
    setDeleting(id)
    await supabase.from('announcements').delete().eq('id', id)
    setAnnouncements((prev) => prev.filter((a) => a.id !== id))
    setDeleting(null)
  }

  const handleToggleAnnouncementActive = async (id: string, currentActive: boolean) => {
    const { error: err } = await supabase
      .from('announcements')
      .update({ is_active: !currentActive, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (!err) {
      setAnnouncements((prev) =>
        prev.map((a) => a.id === id ? { ...a, is_active: !currentActive } : a)
      )
    }
  }

  const handleSaveAnnouncement = async () => {
    setShowAnnouncementForm(false)
    setEditingAnnouncement(null)
    const { data } = await supabase
      .from('announcements')
      .select('*')
      .order('display_order')
    if (data) setAnnouncements(data as Announcement[])
  }

  const activeAnnouncementCount = announcements.filter((a) => a.is_active).length

  const pendingRequestCount = requests.filter((r) => r.status === 'pending').length

  const filteredBusinesses = businesses.filter((b) =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Business Form view
  if (showBusinessForm) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <button
            onClick={() => { setShowBusinessForm(false); setEditingBusiness(null) }}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
          >
            <ChevronLeft size={16} />
            Geri dön
          </button>
          <h2 className="text-2xl font-bold text-navy-800 mb-6">
            {editingBusiness ? 'İşletme Düzenle' : 'Yeni İşletme Ekle'}
          </h2>
          <BusinessForm
            categories={categories}
            business={editingBusiness}
            onSave={handleSaveBusiness}
            onCancel={() => { setShowBusinessForm(false); setEditingBusiness(null) }}
          />
        </div>
      </div>
    )
  }

  // Category Form view
  if (showCategoryForm) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <button
            onClick={() => { setShowCategoryForm(false); setEditingCategory(null) }}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
          >
            <ChevronLeft size={16} />
            Geri dön
          </button>
          <h2 className="text-2xl font-bold text-navy-800 mb-6">
            {editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori Ekle'}
          </h2>
          <CategoryForm
            category={editingCategory}
            onSave={handleSaveCategory}
            onCancel={() => { setShowCategoryForm(false); setEditingCategory(null) }}
          />
        </div>
      </div>
    )
  }

  // Announcement Form view
  if (showAnnouncementForm) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <button
            onClick={() => { setShowAnnouncementForm(false); setEditingAnnouncement(null) }}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
          >
            <ChevronLeft size={16} />
            Geri dön
          </button>
          <h2 className="text-2xl font-bold text-navy-800 mb-6">
            {editingAnnouncement ? 'Duyuru Düzenle' : 'Yeni Duyuru Ekle'}
          </h2>
          <AnnouncementForm
            announcement={editingAnnouncement}
            onSave={handleSaveAnnouncement}
            onCancel={() => { setShowAnnouncementForm(false); setEditingAnnouncement(null) }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-navy-800 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LayoutDashboard size={24} className="text-iznik-400" />
            <div>
              <h1 className="font-bold text-lg">Yönetim Paneli</h1>
              <p className="text-xs text-gray-400">{userEmail}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm text-gray-300 hover:text-white transition-colors hidden sm:block"
            >
              Siteyi Görüntüle
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 px-3 py-2 rounded-lg text-sm transition-colors"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Çıkış</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-iznik-50 flex items-center justify-center">
                <Store size={20} className="text-iznik-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-800">{businesses.length}</p>
                <p className="text-xs text-gray-500">Toplam İşletme</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <Store size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-800">
                  {businesses.filter((b) => b.is_active).length}
                </p>
                <p className="text-xs text-gray-500">Aktif</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-800">
                  {businesses.filter((b) => {
                    return (today && b.valid_until && b.valid_until < today) || !b.is_active
                  }).length}
                </p>
                <p className="text-xs text-gray-500">Pasif / Süresi Dolmuş</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <FolderOpen size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-800">{categories.length}</p>
                <p className="text-xs text-gray-500">Kategori</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <UserPlus size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-800">{pendingRequestCount}</p>
                <p className="text-xs text-gray-500">Bekleyen Başvuru</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Megaphone size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-800">{activeAnnouncementCount}</p>
                <p className="text-xs text-gray-500">Aktif Duyuru</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6">
          <button
            onClick={() => { setActiveTab('businesses'); setSearchTerm('') }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'businesses'
                ? 'bg-white text-navy-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Store size={16} />
            İşletmeler
          </button>
          <button
            onClick={() => { setActiveTab('categories'); setSearchTerm('') }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'categories'
                ? 'bg-white text-navy-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FolderOpen size={16} />
            Kategoriler
          </button>
          <button
            onClick={() => { setActiveTab('requests'); setSearchTerm('') }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'requests'
                ? 'bg-white text-navy-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <UserPlus size={16} />
            Üyelik Talepleri
            {pendingRequestCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center leading-tight">
                {pendingRequestCount}
              </span>
            )}
          </button>
          <button
            onClick={() => { setActiveTab('announcements'); setSearchTerm('') }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'announcements'
                ? 'bg-white text-navy-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Megaphone size={16} />
            Duyurular
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={activeTab === 'businesses' ? 'İşletme ara...' : 'Kategori ara...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-iznik-500 focus:ring-2 focus:ring-iznik-200 outline-none text-sm"
            />
          </div>
          {activeTab === 'businesses' ? (
            <button
              onClick={() => { setEditingBusiness(null); setShowBusinessForm(true) }}
              className="flex items-center justify-center gap-2 bg-iznik-600 hover:bg-iznik-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              <Plus size={18} />
              Yeni İşletme Ekle
            </button>
          ) : activeTab === 'categories' ? (
            <button
              onClick={() => { setEditingCategory(null); setShowCategoryForm(true) }}
              className="flex items-center justify-center gap-2 bg-iznik-600 hover:bg-iznik-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              <Plus size={18} />
              Yeni Kategori Ekle
            </button>
          ) : activeTab === 'announcements' ? (
            <button
              onClick={() => { setEditingAnnouncement(null); setShowAnnouncementForm(true) }}
              className="flex items-center justify-center gap-2 bg-iznik-600 hover:bg-iznik-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              <Plus size={18} />
              Yeni Duyuru Ekle
            </button>
          ) : null}
        </div>

        {/* Content */}
        {activeTab === 'businesses' ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {filteredBusinesses.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-4xl mb-3">📋</p>
                <p className="text-gray-500">Henüz işletme eklenmemiş.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredBusinesses.map((business) => (
                  <div
                    key={business.id}
                    className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-iznik-500 to-navy-600 flex items-center justify-center flex-shrink-0 text-lg">
                        {business.categories?.icon || '🏪'}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm text-navy-800 truncate">
                          {business.name}
                        </h3>
                        <p className="text-xs text-gray-400 truncate">
                          {business.categories?.name || 'Kategorisiz'} • {business.phone || 'Telefon yok'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                      {(() => {
                        const isExpired = today && business.valid_until && business.valid_until < today
                        const daysLeft = business.valid_until
                          ? Math.ceil((new Date(business.valid_until).getTime() - new Date(today).getTime()) / 86400000)
                          : null

                        if (isExpired) {
                          return (
                            <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium bg-red-50 text-red-600" title={`Bitiş: ${new Date(business.valid_until!).toLocaleDateString('tr-TR')}`}>
                              <AlertTriangle size={12} />
                              Süresi Doldu
                            </span>
                          )
                        }
                        if (!business.is_active) {
                          return (
                            <span className="text-xs px-2 py-1 rounded-full font-medium bg-gray-100 text-gray-500">
                              Pasif
                            </span>
                          )
                        }
                        if (daysLeft !== null && daysLeft <= 7) {
                          return (
                            <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium bg-amber-50 text-amber-700" title={`Bitiş: ${new Date(business.valid_until!).toLocaleDateString('tr-TR')}`}>
                              <CalendarDays size={12} />
                              {daysLeft} gün
                            </span>
                          )
                        }
                        if (business.valid_until) {
                          return (
                            <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium bg-green-50 text-green-700" title={`Bitiş: ${new Date(business.valid_until).toLocaleDateString('tr-TR')}`}>
                              <CalendarDays size={12} />
                              {new Date(business.valid_until).toLocaleDateString('tr-TR')}
                            </span>
                          )
                        }
                        return (
                          <span className="text-xs px-2 py-1 rounded-full font-medium bg-green-50 text-green-700">
                            Aktif
                          </span>
                        )
                      })()}
                      <button
                        onClick={() => { setEditingBusiness(business); setShowBusinessForm(true) }}
                        className="p-2 text-gray-400 hover:text-iznik-600 hover:bg-iznik-50 rounded-lg transition-colors"
                        title="Düzenle"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteBusiness(business.id)}
                        disabled={deleting === business.id}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Sil"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === 'categories' ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {filteredCategories.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-4xl mb-3">📂</p>
                <p className="text-gray-500">Henüz kategori eklenmemiş.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0 text-xl">
                        {category.icon}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm text-navy-800 truncate">
                          {category.name}
                        </h3>
                        <p className="text-xs text-gray-400 truncate">
                          Slug: {category.slug} • Sıra: {category.display_order}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                      <span className="text-xs px-2 py-1 rounded-full font-medium bg-purple-50 text-purple-700">
                        {businesses.filter((b) => b.category_id === category.id).length} işletme
                      </span>
                      <button
                        onClick={() => { setEditingCategory(category); setShowCategoryForm(true) }}
                        className="p-2 text-gray-400 hover:text-iznik-600 hover:bg-iznik-50 rounded-lg transition-colors"
                        title="Düzenle"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        disabled={deleting === category.id}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Sil"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === 'requests' ? (
          /* Üyelik Talepleri */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {requests.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-4xl mb-3">📬</p>
                <p className="text-gray-500">Henüz başvuru yok.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                        <Phone size={18} className="text-amber-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm text-navy-800">
                          {request.first_name || request.last_name
                            ? `${request.first_name || ''} ${request.last_name || ''}`.trim()
                            : request.phone}
                        </h3>
                        <p className="text-xs text-gray-400">
                          {request.phone} • {new Date(request.created_at).toLocaleDateString('tr-TR')} {new Date(request.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {request.user_notes && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2 italic">
                            &ldquo;{request.user_notes}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                      {/* Status badge */}
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        request.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                        request.status === 'contacted' ? 'bg-blue-50 text-blue-700' :
                        'bg-green-50 text-green-700'
                      }`}>
                        {request.status === 'pending' ? 'Bekliyor' :
                         request.status === 'contacted' ? 'Arandı' : 'Tamamlandı'}
                      </span>
                      {/* Status action buttons */}
                      {request.status === 'pending' && (
                        <button
                          onClick={() => handleUpdateRequestStatus(request.id, 'contacted')}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Arandı olarak işaretle"
                        >
                          <Phone size={16} />
                        </button>
                      )}
                      {request.status === 'contacted' && (
                        <button
                          onClick={() => handleUpdateRequestStatus(request.id, 'completed')}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Tamamlandı olarak işaretle"
                        >
                          <CheckCircle2 size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteRequest(request.id)}
                        disabled={deleting === request.id}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Sil"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Duyurular */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {announcements.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-4xl mb-3">📢</p>
                <p className="text-gray-500">Henüz duyuru eklenmemiş.</p>
                <button
                  onClick={() => { setEditingAnnouncement(null); setShowAnnouncementForm(true) }}
                  className="mt-4 inline-flex items-center gap-2 bg-iznik-600 hover:bg-iznik-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
                >
                  <Plus size={18} />
                  İlk Duyuruyu Ekle
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-16 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                        <img
                          src={announcement.image_url}
                          alt={announcement.title || 'Banner'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm text-navy-800 truncate">
                          {announcement.title || 'Başlıksız Banner'}
                        </h3>
                        <p className="text-xs text-gray-400 truncate">
                          Sıra: {announcement.display_order}
                          {announcement.link_url && ` • ${announcement.link_url}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                      <button
                        onClick={() => handleToggleAnnouncementActive(announcement.id, announcement.is_active)}
                        className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium transition-colors ${
                          announcement.is_active
                            ? 'bg-green-50 text-green-700 hover:bg-green-100'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                        title={announcement.is_active ? 'Pasif yap' : 'Aktif yap'}
                      >
                        {announcement.is_active ? <Eye size={12} /> : <EyeOff size={12} />}
                        {announcement.is_active ? 'Aktif' : 'Pasif'}
                      </button>
                      <button
                        onClick={() => { setEditingAnnouncement(announcement); setShowAnnouncementForm(true) }}
                        className="p-2 text-gray-400 hover:text-iznik-600 hover:bg-iznik-50 rounded-lg transition-colors"
                        title="Düzenle"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteAnnouncement(announcement.id)}
                        disabled={deleting === announcement.id}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Sil"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
