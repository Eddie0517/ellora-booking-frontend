export interface Profile {
  id: string
  email: string
  fullName: string
  phone: string
  avatarUrl: string | null
  role: 'CUSTOMER' | 'SALON_OWNER' | 'ADMIN'
}
