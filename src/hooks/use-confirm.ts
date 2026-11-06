import { useContext } from 'react'
import { ConfirmContext } from '@/components/providers/confirm-context'

export function useConfirm() {
  const context = useContext(ConfirmContext)
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider')
  }
  return context
}

export type { ConfirmOptions, AlertOptions } from '@/components/providers/confirm-context'
