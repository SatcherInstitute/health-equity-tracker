import type { ScrollableHashId } from '../../utils/hooks/useStepObserver'
import domtoimage from 'dom-to-image-more'
import { CITATION_APA } from './SourcesHelpers'

function hideElementsForScreenshot(node: HTMLElement) {
  return !node?.classList?.contains('hide-on-screenshot')
}

export async function saveCardImage(
  cardId: ScrollableHashId,
  cardTitle: string,
) {
  const targetNode = document.getElementById(cardId) as HTMLElement
  const footer = targetNode?.querySelector('footer')
  let addedDivider: HTMLHRElement | null = null
  let addedParagraph: HTMLParagraphElement | null = null

  if (footer && targetNode) {
    // Add a divider above the card sources footer
    addedDivider = document.createElement('hr')
    addedDivider.classList.add(
      'w-full',
      'border-b',
      'border-solid',
      'border-dividerGrey',
    )
    addedDivider.style.height = '0px'
    footer.parentNode?.insertBefore(addedDivider, footer)

    // Add HET citation below the card sources footer
    addedParagraph = document.createElement('p')
    addedParagraph.innerHTML = CITATION_APA
    footer?.appendChild(addedParagraph)
  }

  try {
    const dataUrl = await domtoimage.toPng(targetNode, {
      scale: 3,
      filter: hideElementsForScreenshot,
      width: targetNode?.offsetWidth,
      height: targetNode?.offsetHeight,
    })

    let fileName = `HET - ${cardTitle} ${new Date().toLocaleDateString(
      'en-US',
      {
        month: 'short',
        year: 'numeric',
      },
    )}.png`

    // replace any unsafe characters in the filename. NOTE: spaces are allowed; we can change if it turns out to be a giant issue
    fileName = fileName.replace('+', 'plus')
    fileName = fileName.replace(/[^a-zA-Z0-9_.\-\s]+/g, '')

    const link = document.createElement('a')
    link.download = fileName
    link.href = dataUrl
    link.click()
    return true
  } catch (error) {
    console.error(
      'oops, something went wrong when saving file. You can try again, or use the built-in screenshot tool. CMD+SHIFT+5 on Mac.',
      error,
    )
    return false
  } finally {
    // Clean up: remove the added elements
    if (addedDivider?.parentNode) {
      addedDivider.parentNode.removeChild(addedDivider)
    }
    if (addedParagraph?.parentNode) {
      addedParagraph.parentNode.removeChild(addedParagraph)
    }
  }
}
