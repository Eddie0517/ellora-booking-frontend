import { createContext } from 'react'

export interface ConfirmOptions {
  title?: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
}

export interface AlertOptions {
  title?: string
  description: string
  confirmText?: string
}

export interface ConfirmContextValue {
  confirm: (options: ConfirmOptions | string) => Promise<boolean>
  alert: (options: AlertOptions | string) => Promise<void>
}

export const ConfirmContext = createContext<ConfirmContextValue | null>(null)
