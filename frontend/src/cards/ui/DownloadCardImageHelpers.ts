import type { ScrollableHashId } from '../../utils/hooks/useStepObserver'
import domtoimage from 'dom-to-image-more'
import { CITATION_APA } from './SourcesHelpers'

function hideElementsForScreenshot(node: HTMLElement) {
  return !node?.classList?.contains('hide-on-screenshot')
}

// TODO: known issue where screenshot captures only what is visible on screen, and hides extra content that's "below the fold"

export async function saveCardImage(
  cardId: ScrollableHashId,
  cardTitle: string,
) {
  const parentCardNode = document.getElementById(cardId) as HTMLElement

  const articleChild = parentCardNode.querySelector('article')
  const targetNode = (articleChild as HTMLElement) || parentCardNode
  articleChild?.classList.remove('shadow-raised')

  // crop final image adjusting for hidden elements that affect height
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
    //add divider to non-multimap cards
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

    // Add HET citation below the card sources footer
    addedParagraph = document.createElement('p')
    addedParagraph.innerHTML = CITATION_APA
    footer?.appendChild(addedParagraph)

    heightToCrop -= getTotalElementHeight(addedParagraph)
    heightToCrop -= getTotalElementHeight(addedDivider)
  }

  try {
    console.log({ heightToCrop })
    const dataUrl = await domtoimage.toPng(targetNode, {
      scale: 3,
      filter: hideElementsForScreenshot,
      width: targetNode?.offsetWidth,
      height: targetNode?.offsetHeight - heightToCrop,
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
      'oops, something went wrong when saving file. You can try again, or use a built-in screenshot tool. CMD+SHIFT+5 on Mac.',
      error,
    )
    return false
  } finally {
    // Clean up: revert card elements
    if (addedDivider?.parentNode) {
      addedDivider.parentNode.removeChild(addedDivider)
    }
    if (addedParagraph?.parentNode) {
      addedParagraph.parentNode.removeChild(addedParagraph)
    }
    articleChild?.classList.add('shadow-raised')
  }
}

function getTotalElementHeight(element: HTMLElement | null) {
  if (!element) {
    return 0
  }
  let height = 0
  height += element.offsetHeight
  height += Number.parseInt(getComputedStyle(element).marginTop)
  return height
}
