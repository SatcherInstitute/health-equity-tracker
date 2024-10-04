import { useState } from 'react'

interface UseClipboardOptions {
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

export function useClipboard(options: UseClipboardOptions = {}) {
  const [isThinking, setIsThinking] = useState(false)
  const [open, setOpen] = useState(false)

  const copyToClipboard = async (
    copyFn: () => Promise<boolean>,
    popover?: { close: () => void },
  ) => {
    setIsThinking(true)
    try {
      const success = await copyFn()
      if (success) {
        setOpen(true)
        options.onSuccess?.()
      }
    } catch (error) {
      options.onError?.(error)
    } finally {
      setIsThinking(false)
      popover?.close()
    }
  }

  const handleClose = () => {
    setOpen(false)
  }

  return {
    isThinking,
    open,
    copyToClipboard,
    handleClose,
  }
}
