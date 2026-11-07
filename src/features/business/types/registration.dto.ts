export interface RegistrationDto {
  id?: number | string | null
  name?: string | null
  address?: string | null
  city?: string | null
  district?: string | null
  phone?: string | null
  email?: string | null
  description?: string | null
  status?: string | null
}

export interface RegistrationRequestDto {
  name: string
  address: string
  city: string
  district: string
  phone: string
  email: string
  description: string
}
