import Header from '@/components/Header'
import Footer from '@/components/Footer'
import BusinessListing from '@/components/BusinessListing'
import MembershipCTA from '@/components/MembershipCTA'
import { createClient } from '@/lib/supabase/server'
import type { BusinessWithCategory } from '@/types/database'

export const revalidate = 60

export default async function HomePage() {
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('display_order')

  const today = new Date().toISOString().split('T')[0]

  const { data: businesses } = await supabase
    .from('businesses')
    .select('*, categories(*)')
    .eq('is_active', true)
    .or(`valid_until.is.null,valid_until.gte.${today}`)
    .order('name')

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-navy-800 via-navy-700 to-iznik-800 text-white py-20 md:py-28 iznik-pattern">
        {/* Dekoratif çini motifleri - sol */}
        <svg className="absolute -left-6 lg:left-8 top-1/2 -translate-y-1/2 w-44 h-44 opacity-[0.05] pointer-events-none hidden lg:block" viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="90" stroke="white" strokeWidth="2"/>
          <circle cx="100" cy="100" r="60" stroke="white" strokeWidth="1.5"/>
          <circle cx="100" cy="100" r="30" stroke="white" strokeWidth="1"/>
          <ellipse cx="100" cy="40" rx="10" ry="25" fill="white"/>
          <ellipse cx="100" cy="160" rx="10" ry="25" fill="white"/>
          <ellipse cx="40" cy="100" rx="25" ry="10" fill="white"/>
          <ellipse cx="160" cy="100" rx="25" ry="10" fill="white"/>
          <ellipse cx="55" cy="55" rx="8" ry="18" fill="white" transform="rotate(-45 55 55)"/>
          <ellipse cx="145" cy="55" rx="8" ry="18" fill="white" transform="rotate(45 145 55)"/>
          <ellipse cx="55" cy="145" rx="8" ry="18" fill="white" transform="rotate(45 55 145)"/>
          <ellipse cx="145" cy="145" rx="8" ry="18" fill="white" transform="rotate(-45 145 145)"/>
          <circle cx="100" cy="100" r="8" fill="white"/>
        </svg>

        {/* Dekoratif çini motifleri - sağ */}
        <svg className="absolute -right-6 lg:right-8 top-1/2 -translate-y-1/2 w-44 h-44 opacity-[0.05] pointer-events-none hidden lg:block" viewBox="0 0 200 200" fill="none">
          <rect x="20" y="20" width="160" height="160" rx="10" stroke="white" strokeWidth="2"/>
          <rect x="50" y="50" width="100" height="100" rx="6" stroke="white" strokeWidth="1.5"/>
          <circle cx="100" cy="100" r="35" stroke="white" strokeWidth="1.5"/>
          <ellipse cx="100" cy="55" rx="8" ry="20" fill="white"/>
          <ellipse cx="100" cy="145" rx="8" ry="20" fill="white"/>
          <ellipse cx="55" cy="100" rx="20" ry="8" fill="white"/>
          <ellipse cx="145" cy="100" rx="20" ry="8" fill="white"/>
          <circle cx="100" cy="100" r="6" fill="white"/>
          <circle cx="35" cy="35" r="8" fill="white" opacity="0.5"/>
          <circle cx="165" cy="35" r="8" fill="white" opacity="0.5"/>
          <circle cx="35" cy="165" r="8" fill="white" opacity="0.5"/>
          <circle cx="165" cy="165" r="8" fill="white" opacity="0.5"/>
        </svg>

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          {/* Üst dekoratif çizgi */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <span className="h-px w-12 bg-gradient-to-r from-transparent to-iznik-400/50" />
            <svg className="w-6 h-6 text-iznik-400 opacity-60" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.2"/>
              <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="0.8"/>
              <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
            </svg>
            <span className="h-px w-12 bg-gradient-to-l from-transparent to-iznik-400/50" />
          </div>

          <h2 className="text-3xl md:text-5xl font-bold mb-5 leading-tight">
            İznik&apos;i İznikle
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-iznik-300 to-iznik-100">Keşfet</span>
          </h2>
          <p className="text-gray-300 text-sm md:text-base max-w-2xl mx-auto leading-relaxed mb-2">
            Çini sanatçılarından yöresel lezzetlere, el sanatlarından teknik servislere —
            İznik&apos;in tüm esnaf ve işletmeleri tek bir platformda.
          </p>

          {/* Alt dekoratif çizgi */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <span className="h-px w-16 bg-gradient-to-r from-transparent to-iznik-400/40" />
            <div className="flex gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-iznik-400/40" />
              <span className="w-1.5 h-1.5 rounded-full bg-iznik-400/60" />
              <span className="w-1.5 h-1.5 rounded-full bg-iznik-400/40" />
            </div>
            <span className="h-px w-16 bg-gradient-to-l from-transparent to-iznik-400/40" />
          </div>
        </div>
      </section>

      {/* Üyelik Başvurusu CTA */}
      <MembershipCTA />

      {/* Main Content */}
      <main className="flex-1 py-12">
        <BusinessListing
          initialCategories={categories || []}
          initialBusinesses={(businesses as BusinessWithCategory[]) || []}
        />
      </main>

      <Footer />
    </div>
  )
}
