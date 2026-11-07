export interface ProfileDto {
  id?: string | number | null
  email?: string | null
  fullName?: string | null
  phone?: string | null
  avatarUrl?: string | null
  role?: string | null
}

export interface UpdateProfileDto {
  fullName: string
  phone: string
  avatarUrl?: string | null
}
