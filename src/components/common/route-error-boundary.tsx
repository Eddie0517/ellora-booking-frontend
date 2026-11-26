import { useEffect } from 'react'
import { useRouteError, isRouteErrorResponse } from 'react-router-dom'
import { RotateCw, AlertTriangle, Home } from 'lucide-react'

export function RouteErrorBoundary() {
  const error = useRouteError()

  const errorMessage =
    error instanceof Error
      ? error.message
      : isRouteErrorResponse(error)
      ? `${error.status} ${error.statusText}`
      : 'Đã xảy ra lỗi không xác định'

  const isChunkError =
    errorMessage.includes('Failed to fetch dynamically imported module') ||
    errorMessage.includes('Importing a module script failed') ||
    errorMessage.includes('error loading dynamically imported module') ||
    errorMessage.includes('ChunkLoadError')

  useEffect(() => {
    if (isChunkError) {
      const lastReload = Number(sessionStorage.getItem('ellora_auto_chunk_reload') || 0)
      const now = Date.now()
      if (now - lastReload > 10000) {
        sessionStorage.setItem('ellora_auto_chunk_reload', String(now))
        window.location.reload()
      }
    }
  }, [isChunkError])

  const handleReload = () => {
    window.location.reload()
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-rose-50 text-brand shadow-xs ring-1 ring-pink-100 mb-5">
        <AlertTriangle size={32} />
      </div>

      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
        {isChunkError ? 'Đang cập nhật phiên bản mới...' : 'Đã có lỗi xảy ra'}
      </h2>

      <p className="mt-2.5 max-w-md text-sm text-gray-600 font-medium">
        {isChunkError
          ? 'Hệ thống vừa được nâng cấp lên bản mới nhất. Vui lòng bấm "Tải lại trang" để tiếp tục sử dụng mượt mà.'
          : 'Trang tạm thời không tải được dữ liệu hoặc kết nối bị gián đoạn. Vui lòng thử tải lại trang.'}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={handleReload}
          className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-brand-dark active:scale-95 cursor-pointer"
        >
          <RotateCw size={16} />
          <span>Tải lại trang</span>
        </button>

        <a
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-2xs transition hover:border-pink-200 hover:bg-rose-50 hover:text-brand"
        >
          <Home size={16} />
          <span>Về trang chủ</span>
        </a>
      </div>
    </div>
  )
}
