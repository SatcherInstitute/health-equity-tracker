import domtoimage from 'dom-to-image-more'
import { CITATION_APA } from '../cards/ui/SourcesHelpers'
import type { ScrollableHashId } from './hooks/useStepObserver'

// Shared constants and types
const SCALE_FACTOR = 3
const UNSAFE_CHAR_REGEX = /[^a-zA-Z0-9_.\-\s]+/g

// Shared utility functions
function hideElementsForScreenshot(node: HTMLElement): boolean {
  return !node?.classList?.contains('hide-on-screenshot')
}

function getTotalElementHeight(element: HTMLElement | null): number {
  if (!element) return 0
  const marginTop = Number.parseInt(getComputedStyle(element).marginTop)
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

interface SaveImageOptions {
  cardId: ScrollableHashId
  cardTitle: string
  destination: 'clipboard' | 'download'
  isRowOfTwo?: boolean
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

interface AddedElements {
  heightToCrop: number
  elements: Array<HTMLElement | null>
}

// Preparation functions
function prepareNodeForCapture(
  node: HTMLElement,
  options: SaveImageOptions,
): AddedElements {
  const articleChild = node.querySelector('article') as HTMLElement | null

  node?.classList.remove('shadow-raised')
  articleChild?.classList.remove('shadow-raised')

  let heightToCrop = 0
  const removeHeightElements = node.querySelectorAll<HTMLElement>(
    '.remove-height-on-screenshot',
  )
  removeHeightElements.forEach((element) => {
    heightToCrop += getTotalElementHeight(element)
  })

  const footer = node.querySelector('footer')
  footer?.classList.add('leading-lhTight', 'pb-4')
  const addedElements: Array<HTMLElement | null> = [null, null]

  if (footer) {
    if (options.cardId === 'rate-map') {
      const mapDivider = document.createElement('div')
      mapDivider.classList.add(
        'w-full',
        'border-b',
        'border-solid',
        'border-dividerGrey',
      )
      mapDivider.style.height = '0px'
      footer.parentNode?.insertBefore(mapDivider, footer)
      addedElements.push(mapDivider)
    }
    if (options.cardId === 'multimap-modal') {
      const modalContentNode = document.querySelector(
        '#multimap-modal-content',
      ) as HTMLElement | null
      // make a duplicate of the footer for the modal
      const clonedFooter = footer.cloneNode(true) as HTMLElement
      clonedFooter.classList.add('remove-after-screenshot')
      modalContentNode?.appendChild(clonedFooter)
      addedElements.push(clonedFooter)
    } else {
      const citation = document.createElement('p')
      citation.innerHTML = CITATION_APA
      footer.appendChild(citation)
      addedElements.push(citation)
    }

    addedElements.forEach((element) => {
      heightToCrop -= getTotalElementHeight(element)
    })
  }

  return { heightToCrop, elements: addedElements }
}

function prepareRowForCapture(rowNode: HTMLElement): AddedElements {
  let heightToCrop = -150
  const removeHeightElements = rowNode.querySelectorAll<HTMLElement>(
    '.remove-height-on-screenshot',
  )
  removeHeightElements.forEach((element) => {
    heightToCrop += getTotalElementHeight(element)
  })

  const articleChildren = rowNode.querySelectorAll<HTMLElement>('article')
  articleChildren.forEach((article) =>
    article.classList.remove('shadow-raised'),
  )

  const citation = document.createElement('p')
  citation.innerHTML = CITATION_APA
  citation.classList.add(
    'text-smallest',
    'px-12',
    'mt-2',
    'mb-0',
    'pt-0',
    'remove-after-screenshot',
  )
  citation.style.width = '100%'
  rowNode.prepend(citation)
  return { heightToCrop, elements: [citation] }
}

// Cleanup functions
function cleanup(
  addedElements: AddedElements,
  articleChild: HTMLElement | null,
): void {
  addedElements.elements.forEach((element) => element?.remove())
  articleChild?.classList.add('shadow-raised')
}

function cleanupRow(rowNode: HTMLElement, addedElements: AddedElements): void {
  addedElements.elements.forEach((element) => element?.remove())
  const elementsToRemove = rowNode.querySelectorAll('.remove-after-screenshot')
  elementsToRemove.forEach((element) => element.remove())
  const articleChildren = rowNode.querySelectorAll<HTMLElement>('article')
  articleChildren.forEach((article) => article.classList.add('shadow-raised'))
  rowNode.classList.remove('bg-white', 'm-0', 'w-full')
}

export async function saveCardImage(
  options: SaveImageOptions,
): Promise<string | undefined> {
  const { cardId, isRowOfTwo = false } = options
  const targetNode = isRowOfTwo
    ? (document.getElementById(cardId + '-row') as HTMLElement)
    : (document.getElementById(cardId) as HTMLElement)

  if (!targetNode) return

  if (isRowOfTwo) {
    targetNode.classList.add('bg-white', 'm-0', 'w-full')
    return saveRowOfTwoCardsImage(targetNode, options)
  }

  return saveSingleCardImage(targetNode, options)
}

// Split into two specialized functions
async function saveSingleCardImage(
  targetNode: HTMLElement,
  options: SaveImageOptions,
): Promise<string | undefined> {
  const articleChild = targetNode.querySelector('article') as HTMLElement | null
  const nodeToCapture = articleChild || targetNode
  const addedElements = prepareNodeForCapture(nodeToCapture, options)

  try {
    return await captureAndSaveImage(nodeToCapture, addedElements, options)
  } finally {
    cleanup(addedElements, articleChild)
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
    cleanupRow(rowNode, addedElements)
  }
}

interface DomToImageOptions {
  scale: number
  filter: (node: HTMLElement) => boolean
  width?: number
  height?: number
}

// Shared capture logic
async function captureAndSaveImage(
  node: HTMLElement,
  addedElements: AddedElements,
  options: SaveImageOptions,
): Promise<string | undefined> {
  try {
    const domToImageOptions: DomToImageOptions = {
      scale: SCALE_FACTOR,
      filter: hideElementsForScreenshot,
      width: node.offsetWidth,
      height: node.offsetHeight - addedElements.heightToCrop,
    }

    const dataUrl = await domtoimage.toPng(node, domToImageOptions)
    return await handleDestination(dataUrl, options)
  } catch (error: unknown) {
    console.error(
      'Screenshot failed:',
      error instanceof Error ? error.message : 'Unknown error',
    )
  }
}
