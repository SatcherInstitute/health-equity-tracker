import { useState } from 'react'
import type { PopoverElements } from './usePopover'
import type { ScrollableHashId } from './useStepObserver'
import { reportProviderSteps } from '../../reports/ReportProviderSteps'
import { saveCardImage } from '../../cards/ui/DownloadCardImageHelpers'

export function useCardImage(
  cardMenuPopover: PopoverElements,
  scrollToHash: ScrollableHashId,
  urlWithHash?: string,
) {
  const [isThinking, setIsThinking] = useState(false)
  const [hetDialogOpen, setHetDialogOpen] = useState(false)
  const [imgDataUrl, setImgDataUrl] = useState<string | null>(null)

  const handleCopyImgToClipboard = async () => {
    setIsThinking(true)
    try {
      const result = await saveCardImage(scrollToHash, cardName, 'clipboard')
      if (typeof result === 'string') {
        setImgDataUrl(result)
        setHetDialogOpen(true)
      }
    } finally {
      setIsThinking(false)
    }
  }

  const handleDownloadImg = async () => {
    setIsThinking(true)
    try {
      await saveCardImage(scrollToHash, cardName, 'download')
      cardMenuPopover?.close()
    } finally {
      setIsThinking(false)
    }
  }

  const handleCopyLink = async () => {
    if (urlWithHash) {
      await navigator.clipboard.writeText(urlWithHash)
      setHetDialogOpen(true)
    }
  }

  function handleClose() {
    setIsThinking(false)
    setHetDialogOpen(false)
    cardMenuPopover.close()
    setImgDataUrl(null)
  }

  const cardName = reportProviderSteps[scrollToHash].label

  return {
    cardName,
    isThinking,
    setIsThinking,
    imgDataUrl,
    setImgDataUrl,
    hetDialogOpen,
    setHetDialogOpen,
    handleCopyImgToClipboard,
    handleDownloadImg,
    handleCopyLink,
    handleClose,
  }
}
