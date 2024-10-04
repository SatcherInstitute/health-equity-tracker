import { useState } from 'react'
import type { PopoverElements } from './usePopover'
import type { ScrollableHashId } from './useStepObserver'
import { reportProviderSteps } from '../../reports/ReportProviderSteps'
import { saveCardImage } from '../../cards/ui/DownloadCardImageHelpers'

export function useCardImage(
  cardMenuPopover: PopoverElements,
  scrollToHash: ScrollableHashId,
) {
  const [isThinking, setIsThinking] = useState(false)
  const [hetDialogOpen, setHetDialogOpen] = useState(false)
  const [imgDataUrl, setImgDataUrl] = useState<string | null>(null)

  const cardName = reportProviderSteps[scrollToHash].label
  const urlWithoutHash = window.location.href.split('#')[0]
  const cardUrlWithHash = `${urlWithoutHash}#${scrollToHash}`

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
    if (cardUrlWithHash) {
      await navigator.clipboard.writeText(cardUrlWithHash)
      setHetDialogOpen(true)
    }
  }

  function handleClose() {
    setIsThinking(false)
    setHetDialogOpen(false)
    cardMenuPopover.close()
    setImgDataUrl(null)
  }

  return {
    cardName,
    cardUrlWithHash,
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
