import domtoimage from 'dom-to-image-more'
import { useState } from 'react'
import { CITATION_APA } from '../../cards/ui/SourcesHelpers'
import { reportProviderSteps } from '../../reports/ReportProviderSteps'
import type { PopoverElements } from './usePopover'
import type { ScrollableHashId } from './useStepObserver'

export function useCardImage(
  cardMenuPopover: PopoverElements,
  scrollToHash: ScrollableHashId,
) {
  // STATE
  const [isThinking, setIsThinking] = useState(false)
  const [hetDialogOpen, setHetDialogOpen] = useState(false)
  const [imgDataUrl, setImgDataUrl] = useState<string | null>(null)

  // COMPUTED VALUES
  const cardName = reportProviderSteps[scrollToHash].label
  const urlWithoutHash = window.location.href.split('#')[0]
  const cardUrlWithHash = `${urlWithoutHash}#${scrollToHash}`

  // HANDLERS
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

  // HOOK RETURN
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

// INTERNAL HELPERS
const SCALE_FACTOR = 3
const UNSAFE_CHAR_REGEX = /[^a-zA-Z0-9_.\-\s]+/g

interface DomToImageOptions {
  scale: number
  filter: (node: HTMLElement) => boolean
  width?: number
  height?: number
}

async function saveCardImage(
  cardId: ScrollableHashId,
  cardTitle: string,
  destination: 'clipboard' | 'download',
): Promise<boolean | any> {
  const parentCardNode = document.getElementById(cardId) as HTMLElement
  const articleChild = parentCardNode?.querySelector(
    'article',
  ) as HTMLElement | null
  const targetNode = articleChild || parentCardNode
  articleChild?.classList.remove('shadow-raised')

  let heightToCrop = 0
  const removeHeightOnScreenshotElements: NodeListOf<HTMLElement> =
    targetNode.querySelectorAll('.remove-height-on-screenshot')

  if (removeHeightOnScreenshotElements) {
    removeHeightOnScreenshotElements.forEach((element) => {
      heightToCrop += getTotalElementHeight(element)
    })
  }

  const footer = targetNode?.querySelector('footer')
  let addedDivider: HTMLDivElement | null = null
  let addedParagraph: HTMLParagraphElement | null = null

  if (footer && targetNode) {
    if (cardId !== 'multimap-modal') {
      addedDivider = document.createElement('div')
      addedDivider.classList.add(
        'w-full',
        'border-b',
        'border-solid',
        'border-dividerGrey',
      )
      addedDivider.style.height = '0px'
      footer.parentNode?.insertBefore(addedDivider, footer)
    }

    addedParagraph = document.createElement('p')
    addedParagraph.innerHTML = CITATION_APA
    footer?.appendChild(addedParagraph)

    heightToCrop -= getTotalElementHeight(addedParagraph)
    heightToCrop -= getTotalElementHeight(addedDivider)
  }
  async function dataURLtoBlob(dataURL: string): Promise<Blob> {
    const response = await fetch(dataURL)
    return response.blob()
  }

  try {
    const options: DomToImageOptions = {
      scale: SCALE_FACTOR,
      filter: hideElementsForScreenshot,
      width: targetNode?.offsetWidth,
      height: targetNode?.offsetHeight - heightToCrop,
    }

    const dataUrl = await domtoimage.toPng(targetNode, options)

    if (destination === 'clipboard') {
      try {
        const blob = await dataURLtoBlob(dataUrl)
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob,
          }),
        ])
        return dataUrl
      } catch (clipboardError) {
        console.error('Failed to write to clipboard:', clipboardError)
        return false
      }
    } else if (destination === 'download') {
      const fileName = createFileName(cardTitle)
      const link = document.createElement('a')
      link.download = fileName
      link.href = dataUrl
      link.click()
    }

    return true
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Screenshot failed: ${error.message}`)
    } else {
      console.error('Screenshot failed with unknown error')
    }
    return false
  } finally {
    cleanup([addedDivider, addedParagraph], articleChild)
  }
}

function hideElementsForScreenshot(node: HTMLElement): boolean {
  return !node?.classList?.contains('hide-on-screenshot')
}

function getTotalElementHeight(element: HTMLElement | null): number {
  if (!element) {
    return 0
  }
  const marginTop = Number.parseInt(getComputedStyle(element).marginTop)
  return element.offsetHeight + marginTop
}

function createFileName(cardTitle: string): string {
  const date = new Date().toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })
  const fileName = `HET - ${cardTitle} ${date}.png`
  return fileName.replace('+', 'plus').replace(UNSAFE_CHAR_REGEX, '')
}

// Remove added elements, reset styles
function cleanup(
  addedNodes: Array<HTMLElement | null>,
  articleChild: HTMLElement | null,
): void {
  if (addedNodes) {
    addedNodes.forEach((node) => {
      node?.remove()
    })
  }

  articleChild?.classList.add('shadow-raised')
}
