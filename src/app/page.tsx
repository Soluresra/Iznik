import Header from '@/components/Header'
import Footer from '@/components/Footer'
import BusinessListing from '@/components/BusinessListing'
import MembershipCTA from '@/components/MembershipCTA'
import HeroBanner from '@/components/HeroBanner'
import { createClient } from '@/lib/supabase/server'
import type { BusinessWithCategory, Announcement } from '@/types/database'

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

  const { data: announcements } = await supabase
    .from('announcements')
    .select('*')
    .eq('is_active', true)
    .order('display_order')

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Banner / Slider */}
      <HeroBanner banners={(announcements as Announcement[]) || []} />

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
