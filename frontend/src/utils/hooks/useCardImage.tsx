import { useState } from 'react'
import { reportProviderSteps } from '../../reports/ReportProviderSteps'
import { saveCardImage } from '../cardImageExportUtils'
import type { PopoverElements } from './usePopover'
import type { ScrollableHashId } from './useStepObserver'

// Consolidated functionality for exporting card images as links, saved images, clipboard images, etc
export function useCardImage(
  cardMenuPopover: PopoverElements,
  scrollToHash: ScrollableHashId,
  downloadTitle?: string,
) {
  const [isThinking, setIsThinking] = useState(false)
  const [confirmationOpen, setConfirmationOpen] = useState(false)
  const [errorOpen, setErrorOpen] = useState(false)
  const [imgDataUrl, setImgDataUrl] = useState<string | null>(null)

  const cardName = reportProviderSteps[scrollToHash].label
  const urlWithoutHash = window.location.href.split('#')[0]
  const cardUrlWithHash = `${urlWithoutHash}#${scrollToHash}`

  const handleImageAction = async (
  destination: 'clipboard' | 'download',
  isRowOfTwo: boolean = false,
  ) => {
    if (destination === 'clipboard') {
      setConfirmationOpen(false)
      setErrorOpen(false)
    }

    setIsThinking(true)
    try {
      const result = await saveCardImage({
        cardId: scrollToHash,
        cardTitle: downloadTitle || cardName,
        destination,
        isRowOfTwo,
      })
      if (destination === 'clipboard') {
        if (typeof result === 'string') {
          setErrorOpen(false)
          setImgDataUrl(result)
          setConfirmationOpen(true)
          } else {
              setConfirmationOpen(false)
              setErrorOpen(true)
          }
      }
      if (destination === 'download') {
        cardMenuPopover?.close()
      }
    } finally {
      setIsThinking(false)
    }
  }

  return {
    cardName,
    cardUrlWithHash,
    isThinking,
    setIsThinking,
    imgDataUrl,
    confirmationOpen,
    errorOpen,
    handleCopyImgToClipboard: () => handleImageAction('clipboard'),
    handleDownloadImg: () => handleImageAction('download'),
    handleDownloadRowImg: () => handleImageAction('download', true),
    handleCopyRowImgToClipboard: () => handleImageAction('clipboard', true),
    handleCopyLink: async () => {
      if (cardUrlWithHash) {
        await navigator.clipboard.writeText(cardUrlWithHash)
        setConfirmationOpen(true)
      }
    },
    handleClose: () => {
    setIsThinking(false)
    setConfirmationOpen(false)
    setErrorOpen(false)
    cardMenuPopover.close()
    setImgDataUrl(null)
    },
  }
}
