export interface Category {
  id: string
  name: string
  slug: string
  icon: string
  display_order: number
  created_at: string
}

export interface Business {
  id: string
  name: string
  description: string | null
  category_id: string | null
  phone: string | null
  whatsapp: string | null
  instagram: string | null
  image_url: string | null
  address: string | null
  tags: string[]
  is_active: boolean
  valid_from: string | null
  valid_until: string | null
  created_at: string
  updated_at: string
}

export interface BusinessWithCategory extends Business {
  categories: Category | null
}

export interface MembershipRequest {
  id: string
  phone: string
  status: 'pending' | 'contacted' | 'completed'
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: Category
        Insert: Omit<Category, 'id' | 'created_at'>
        Update: Partial<Omit<Category, 'id' | 'created_at'>>
      }
      businesses: {
        Row: Business
        Insert: Omit<Business, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Business, 'id' | 'created_at'>>
      }
      membership_requests: {
        Row: MembershipRequest
        Insert: Pick<MembershipRequest, 'phone'>
        Update: Partial<Omit<MembershipRequest, 'id' | 'created_at'>>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
