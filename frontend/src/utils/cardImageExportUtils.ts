import domtoimage from 'dom-to-image-more'
import { MULTIMAP_MODAL_CONTENT_ID } from '../cards/ui/MultiMapDialog'
import { CITATION_APA } from '../cards/ui/SourcesHelpers'
import { LEGEND_ITEMS_BOX_CLASS } from '../charts/choroplethMap/RateMapLegend'
import type { ScrollableHashId } from './hooks/useStepObserver'

// Constants
const SCALE_FACTOR = 3
const UNSAFE_CHAR_REGEX = /[^a-zA-Z0-9_.\-\s]+/g
const SCREENSHOT_REMOVE_HEIGHT_CLASS = 'remove-height-on-screenshot'
const SCREENSHOT_REVERT_TO_NORMAL = 'remove-after-screenshot'

// Types
interface SaveImageOptions {
  cardId: ScrollableHashId
  cardTitle: string
  destination: 'clipboard' | 'download'
  isRowOfTwo?: boolean
}

interface AddedElements {
  heightToCrop: number
  elements: Array<HTMLElement | null>
}

interface DomToImageOptions {
  scale: number
  filter: (node: HTMLElement) => boolean
  width?: number
  height?: number
}

// Utility functions
function hideElementsForScreenshot(node: HTMLElement): boolean {
  return !node?.classList?.contains('hide-on-screenshot')
}

function getTotalElementHeight(element: HTMLElement | null): number {
  if (!element) return 0
  const marginTop = Number.parseInt(getComputedStyle(element).marginTop, 10)
  return element.offsetHeight + marginTop
}

function createFileName(cardTitle: string): string {
  const date = new Date().toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })
  const fileName = `HET ${cardTitle} ${date}.png`
  return fileName.replace('+', 'plus').replace(UNSAFE_CHAR_REGEX, '')
}

async function dataURLtoBlob(dataURL: string): Promise<Blob> {
  const response = await fetch(dataURL)
  return response.blob()
}

async function handleDestination(dataUrl: string, options: SaveImageOptions) {
  if (options.destination === 'clipboard') {
    try {
      const blob = await dataURLtoBlob(dataUrl)
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ])
    } catch (clipboardError) {
      console.error('Failed to write to clipboard:', clipboardError)
    }
  } else if (options.destination === 'download') {
    const fileName = createFileName(options.cardTitle)
    const link = document.createElement('a')
    link.download = fileName
    link.href = dataUrl
    link.click()
  }
  return dataUrl
}

function removeLegendBorders(): void {
  const legendItemsBoxes = document.querySelectorAll(
    `.${LEGEND_ITEMS_BOX_CLASS}`,
  )
  legendItemsBoxes.forEach((box) => {
    box.classList.remove(
      'border-0',
      'border-grey-grid-color-darker',
      'border-t',
      'border-solid',
    )
    box.classList.add('border-none')
  })
}

function restoreLegendBorders(): void {
  const legendItemsBoxes = document.querySelectorAll(
    `.${LEGEND_ITEMS_BOX_CLASS}`,
  )
  legendItemsBoxes.forEach((box) => {
    box.classList.remove('border-none')
    box.classList.add(
      'border-0',
      'border-grey-grid-color-darker',
      'border-t',
      'border-solid',
    )
  })
}

function removeShadows(node: HTMLElement): void {
  node.classList.remove('shadow-raised')
  const articleChild = node.querySelector('article') as HTMLElement | null
  articleChild?.classList.remove('shadow-raised')
}

function removeAllShadows(rowNode: HTMLElement): void {
  const articleChildren = rowNode.querySelectorAll<HTMLElement>('article')
  articleChildren.forEach((article) =>
    article.classList.remove('shadow-raised'),
  )
}

function restoreAllShadows(rowNode: HTMLElement): void {
  const articleChildren = rowNode.querySelectorAll<HTMLElement>('article')
  articleChildren.forEach((article) => article.classList.add('shadow-raised'))
}

function calculateHeightToCrop(node: HTMLElement, baseHeight = 0): number {
  let heightToCrop = baseHeight
  const removeHeightElements = node.querySelectorAll<HTMLElement>(
    `.${SCREENSHOT_REMOVE_HEIGHT_CLASS}`,
  )
  removeHeightElements.forEach((element) => {
    heightToCrop += getTotalElementHeight(element)
  })
  return heightToCrop
}

// Footer handling
function handleFooterForCard(
  footer: HTMLElement,
  options: SaveImageOptions,
): HTMLElement[] {
  const addedElements: HTMLElement[] = []

  footer.classList.add('leading-tight', 'pb-4')

  if (options.cardId === 'rate-map') {
    const mapDivider = document.createElement('div')
    mapDivider.classList.add(
      'w-full',
      'border-b',
      'border-solid',
      'border-divider-grey',
    )
    mapDivider.style.height = '0px'
    footer.parentNode?.insertBefore(mapDivider, footer)
    addedElements.push(mapDivider)
  }

  if (options.cardId === 'multimap-modal') {
    const modalContentNode = document.querySelector(
      `#${MULTIMAP_MODAL_CONTENT_ID}`,
    ) as HTMLElement | null
    const clonedFooter = footer.cloneNode(true) as HTMLElement
    clonedFooter.classList.add(SCREENSHOT_REVERT_TO_NORMAL)
    modalContentNode?.appendChild(clonedFooter)
    addedElements.push(clonedFooter)
  } else {
    const citation = document.createElement('p')
    citation.innerHTML = CITATION_APA
    footer.appendChild(citation)
    addedElements.push(citation)
  }

  return addedElements
}

// Preparation functions
function prepareNodeForCapture(
  node: HTMLElement,
  options: SaveImageOptions,
): AddedElements {
  removeShadows(node)
  removeLegendBorders()

  let heightToCrop = calculateHeightToCrop(node)
  const footer = node.querySelector('footer') as HTMLElement | null
  const addedElements: Array<HTMLElement | null> = [null, null]

  if (footer) {
    const footerElements = handleFooterForCard(footer, options)
    addedElements.push(...footerElements)

    // Subtract added elements from height to crop
    footerElements.forEach((element) => {
      heightToCrop -= getTotalElementHeight(element)
    })
  }

  return { heightToCrop, elements: addedElements }
}

function prepareRowForCapture(rowNode: HTMLElement): AddedElements {
  const heightToCrop = calculateHeightToCrop(rowNode, -150)

  removeAllShadows(rowNode)
  removeLegendBorders()

  const citation = document.createElement('p')
  citation.innerHTML = CITATION_APA
  citation.classList.add(
    'text-smallest',
    'px-12',
    'mt-2',
    'mb-0',
    'pt-0',
    SCREENSHOT_REVERT_TO_NORMAL,
  )
  citation.style.width = '100%'
  rowNode.prepend(citation)

  return { heightToCrop, elements: [citation] }
}

function prepareModalContentForCapture(
  node: HTMLElement,
  options: SaveImageOptions,
): AddedElements {
  removeShadows(node)
  removeLegendBorders()

  // Temporarily remove any overflow hidden or height constraints
  const originalOverflow = node.style.overflow
  const originalMaxHeight = node.style.maxHeight
  const originalHeight = node.style.height

  node.style.overflow = 'visible'
  node.style.maxHeight = 'none'
  node.style.height = 'auto'

  const heightToCrop = calculateHeightToCrop(node)
  const addedElements: Array<HTMLElement | null> = [
    { originalOverflow, originalMaxHeight, originalHeight } as any,
  ]

  if (options.cardId === 'multimap-modal') {
    const footerDiv = document.createElement('div')
    footerDiv.className = 'mt-4 pt-2 '

    const modalFooter = document.getElementById('modal-footer')
    if (modalFooter) {
      const modalFooterClone = modalFooter.cloneNode(true) as HTMLElement
      footerDiv.appendChild(modalFooterClone)
    }

    const citation = document.createElement('p')
    citation.innerHTML = CITATION_APA
    citation.className = 'text-smallest pl-3 pt-0 mt-0 leading-tight'

    footerDiv.appendChild(citation)
    footerDiv.classList.add(SCREENSHOT_REVERT_TO_NORMAL)

    node.appendChild(footerDiv)
    addedElements.push(footerDiv)
  }

  return { heightToCrop, elements: addedElements }
}

// Cleanup functions
function cleanupSingleCard(
  addedElements: AddedElements,
  articleChild: HTMLElement | null,
): void {
  addedElements.elements.forEach((element) => element?.remove())
  articleChild?.classList.add('shadow-raised')
  restoreLegendBorders()
}

function cleanupRowOfTwoCards(
  rowNode: HTMLElement,
  addedElements: AddedElements,
): void {
  addedElements.elements.forEach((element) => element?.remove())

  const elementsToRemove = rowNode.querySelectorAll(
    `.${SCREENSHOT_REVERT_TO_NORMAL}`,
  )
  elementsToRemove.forEach((element) => element.remove())

  restoreAllShadows(rowNode)
  rowNode.classList.remove('bg-white', 'm-0', 'w-full')
  restoreLegendBorders()
}

function cleanupModalContent(
  addedElements: AddedElements,
  node: HTMLElement,
): void {
  const originalStyles = addedElements.elements[0] as any

  // Restore original styles
  node.style.overflow = originalStyles.originalOverflow || ''
  node.style.maxHeight = originalStyles.originalMaxHeight || ''
  node.style.height = originalStyles.originalHeight || ''

  // Clean up other elements (skip the first one which is the styles object)
  addedElements.elements.slice(1).forEach((element) => element?.remove())
  restoreLegendBorders()
}

async function captureAndSaveImage(
  node: HTMLElement,
  addedElements: AddedElements,
  options: SaveImageOptions,
): Promise<string | undefined> {
  try {
    // For modal content, we need to use the full scrollHeight
    const height =
      options.cardId === 'multimap-modal'
        ? node.scrollHeight - addedElements.heightToCrop
        : node.offsetHeight - addedElements.heightToCrop

    const width =
      options.cardId === 'multimap-modal' ? node.scrollWidth : node.offsetWidth

    const domToImageOptions: DomToImageOptions = {
      scale: SCALE_FACTOR,
      filter: hideElementsForScreenshot,
      width: width,
      height: height,
    }

    // Get all node elements including the card node itself
    const allCardElements = [node, ...Array.from(node.querySelectorAll('*'))]

    allCardElements.forEach((el) => {
      const htmlEl = el as HTMLElement
      htmlEl.style.border = 'none'
      htmlEl.style.outline = 'none'
      htmlEl.style.boxShadow = 'none'
    })

    const dataUrl = await domtoimage.toPng(node, domToImageOptions)
    return await handleDestination(dataUrl, options)
  } catch (error: unknown) {
    console.error(
      'Screenshot failed:',
      error instanceof Error ? error.message : 'Unknown error',
    )
  }
}

async function saveSingleCardImage(
  targetNode: HTMLElement,
  options: SaveImageOptions,
): Promise<string | undefined> {
  const articleChild = targetNode.querySelector('article') as HTMLElement | null
  const nodeToCapture = articleChild || targetNode

  // Use modal-specific preparation for multimap modal
  const addedElements =
    options.cardId === 'multimap-modal'
      ? prepareModalContentForCapture(nodeToCapture, options)
      : prepareNodeForCapture(nodeToCapture, options)

  try {
    return await captureAndSaveImage(nodeToCapture, addedElements, options)
  } finally {
    if (options.cardId === 'multimap-modal') {
      cleanupModalContent(addedElements, nodeToCapture)
    } else {
      cleanupSingleCard(addedElements, articleChild)
    }
  }
}

async function saveRowOfTwoCardsImage(
  rowNode: HTMLElement,
  options: SaveImageOptions,
): Promise<string | undefined> {
  const addedElements = prepareRowForCapture(rowNode)

  try {
    return await captureAndSaveImage(rowNode, addedElements, options)
  } finally {
    cleanupRowOfTwoCards(rowNode, addedElements)
  }
}

export async function saveCardImage(
  options: SaveImageOptions,
): Promise<string | undefined> {
  const { cardId, isRowOfTwo = false } = options

  let targetNode: HTMLElement | null = null

  if (cardId === 'multimap-modal') {
    // For multimap modal, capture the content div directly, not the modal wrapper
    targetNode = document.getElementById(
      MULTIMAP_MODAL_CONTENT_ID,
    ) as HTMLElement
  } else if (isRowOfTwo) {
    targetNode = document.getElementById(cardId + '-row') as HTMLElement
  } else {
    targetNode = document.getElementById(cardId) as HTMLElement
  }

  if (!targetNode) return

  if (isRowOfTwo) {
    targetNode.classList.add('bg-white', 'm-0', 'w-full')
    return saveRowOfTwoCardsImage(targetNode, options)
  }

  return saveSingleCardImage(targetNode, options)
}
