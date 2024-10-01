import type { ScrollableHashId } from '../../utils/hooks/useStepObserver'
import domtoimage from 'dom-to-image-more'
import { CITATION_APA } from './SourcesHelpers'

function hideElementsForScreenshot(node: HTMLElement) {
  return !node?.classList?.contains('hide-on-screenshot')
}

export async function saveCardImage(cardId: ScrollableHashId) {
  const targetNode = document.getElementById(cardId) as HTMLElement
  const footer = targetNode?.querySelector('footer')
  let addedDivider: HTMLHRElement | null = null
  let addedParagraph: HTMLParagraphElement | null = null

  if (footer && targetNode) {
    addedDivider = document.createElement('hr')
    addedDivider.classList.add(
      'w-full',
      'border-b',
      'border-solid',
      'border-dividerGrey',
    )
    addedDivider.style.height = '0px'
    footer.parentNode?.insertBefore(addedDivider, footer)

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

    const link = document.createElement('a')
    link.download = 'my-image-name.png'
    link.href = dataUrl
    link.click()
    return true
  } catch (error) {
    console.error('oops, something went wrong!', error)
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
