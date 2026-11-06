import {
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { AlertTriangle, Info } from 'lucide-react'
import {
  ConfirmContext,
  type ConfirmOptions,
  type AlertOptions,
} from './confirm-context'

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [isAlertOnly, setIsAlertOnly] = useState(false)
  const [config, setConfig] = useState<{
    title: string
    description: string
    confirmText: string
    cancelText: string
    variant: 'default' | 'destructive'
  }>({
    title: 'Xác nhận',
    description: '',
    confirmText: 'Xác nhận',
    cancelText: 'Hủy',
    variant: 'default',
  })

  const resolverRef = useRef<((value: boolean) => void) | null>(null)

  const confirm = useCallback((options: ConfirmOptions | string) => {
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve
      setIsAlertOnly(false)

      if (typeof options === 'string') {
        const isDelete = /xóa|hủy|từ chối|khóa/i.test(options)
        setConfig({
          title: 'Xác nhận',
          description: options,
          confirmText: isDelete ? 'Xóa' : 'Xác nhận',
          cancelText: 'Hủy',
          variant: isDelete ? 'destructive' : 'default',
        })
      } else {
        setConfig({
          title: options.title ?? 'Xác nhận',
          description: options.description,
          confirmText: options.confirmText ?? 'Xác nhận',
          cancelText: options.cancelText ?? 'Hủy',
          variant: options.variant ?? 'default',
        })
      }

      setOpen(true)
    })
  }, [])

  const alert = useCallback((options: AlertOptions | string) => {
    return new Promise<void>((resolve) => {
      resolverRef.current = () => resolve()
      setIsAlertOnly(true)

      if (typeof options === 'string') {
        setConfig({
          title: 'Thông báo',
          description: options,
          confirmText: 'Đóng',
          cancelText: '',
          variant: 'default',
        })
      } else {
        setConfig({
          title: options.title ?? 'Thông báo',
          description: options.description,
          confirmText: options.confirmText ?? 'Đóng',
          cancelText: '',
          variant: 'default',
        })
      }

      setOpen(true)
    })
  }, [])

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    if (!nextOpen) {
      if (resolverRef.current) {
        resolverRef.current(false)
        resolverRef.current = null
      }
      setOpen(false)
    }
  }, [])

  const handleConfirm = useCallback(() => {
    if (resolverRef.current) {
      resolverRef.current(true)
      resolverRef.current = null
    }
    setOpen(false)
  }, [])

  const handleCancel = useCallback(() => {
    if (resolverRef.current) {
      resolverRef.current(false)
      resolverRef.current = null
    }
    setOpen(false)
  }, [])

  return (
    <ConfirmContext.Provider value={{ confirm, alert }}>
      {children}
      <AlertDialog open={open} onOpenChange={handleOpenChange}>
        <AlertDialogContent className="sm:max-w-[420px]">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div
                className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
                  config.variant === 'destructive'
                    ? 'bg-red-50 text-red-600'
                    : 'bg-rose-50 text-[#8C3A5A]'
                }`}
              >
                {config.variant === 'destructive' ? (
                  <AlertTriangle className="size-5" />
                ) : (
                  <Info className="size-5" />
                )}
              </div>
              <AlertDialogTitle className="text-lg font-semibold text-gray-900">
                {config.title}
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="pt-2 text-sm leading-relaxed text-gray-600">
              {config.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2 sm:gap-3">
            {!isAlertOnly && (
              <AlertDialogCancel
                onClick={handleCancel}
                className="rounded-lg border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {config.cancelText}
              </AlertDialogCancel>
            )}
            <AlertDialogAction
              variant={config.variant}
              onClick={handleConfirm}
              className={`rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm ${
                config.variant === 'destructive'
                  ? 'bg-red-600 hover:bg-red-700 focus-visible:ring-red-500'
                  : 'bg-[#8C3A5A] hover:bg-[#722e48] focus-visible:ring-[#8C3A5A]'
              }`}
            >
              {config.confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmContext.Provider>
  )
}

export type { ConfirmOptions, AlertOptions } from './confirm-context'
