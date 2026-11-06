export function pickField<T extends object, K extends keyof T>(
  value: T | null | undefined,
  keys: readonly K[],
  fallback: T[K] | null = null
): T[K] | null {
  if (!value) return fallback

  // If value is wrapped in ApiResponse { success: true, data: { ... } }
  const unwrapped =
    'data' in value && value.data && typeof value.data === 'object' && !Array.isArray(value.data)
      ? (value as unknown as { data: Record<string, unknown> }).data
      : null

  for (const key of keys) {
    const rawVal = (value as Record<string, unknown>)[key as string]
    if (rawVal !== undefined && rawVal !== null) return rawVal as T[K]

    if (unwrapped) {
      const innerVal = unwrapped[key as string]
      if (innerVal !== undefined && innerVal !== null) return innerVal as T[K]
    }
  }
  return fallback
}

export const safeString = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value : typeof value === 'number' ? String(value) : fallback

export const safeNumber = (value: unknown, fallback = 0): number => {
  const number = typeof value === 'number' || typeof value === 'string' ? Number(value) : NaN
  return Number.isFinite(number) ? number : fallback
}

export const safeArray = <T>(value: unknown): T[] => {
  if (Array.isArray(value)) return value as T[]
  if (value && typeof value === 'object' && 'data' in value && Array.isArray((value as Record<string, unknown>).data)) {
    return (value as Record<string, unknown>).data as T[]
  }
  return []
}
