import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminDashboard from '@/components/admin/AdminDashboard'
import type { BusinessWithCategory, MembershipRequest, Announcement } from '@/types/database'

export default async function AdminPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('display_order')

  const { data: businesses } = await supabase
    .from('businesses')
    .select('*, categories(*)')
    .order('created_at', { ascending: false })

  const { data: membershipRequests } = await supabase
    .from('membership_requests')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: announcements } = await supabase
    .from('announcements')
    .select('*')
    .order('display_order')

  return (
    <AdminDashboard
      categories={categories || []}
      initialBusinesses={(businesses as BusinessWithCategory[]) || []}
      initialRequests={(membershipRequests as MembershipRequest[]) || []}
      initialAnnouncements={(announcements as Announcement[]) || []}
      userEmail={user.email || ''}
    />
  )
}
