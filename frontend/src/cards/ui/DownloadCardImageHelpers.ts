import { CITATION_APA } from '../../pages/Methodology/methodologyComponents/MethodologyPage'
import HetDivider from '../../styles/HetComponents/HetDivider'
import type { ScrollableHashId } from '../../utils/hooks/useStepObserver'
import domtoimage from 'dom-to-image-more'

function hideElementsForScreenshot(node: HTMLElement) {
  return !node?.classList?.contains('hide-on-screenshot')
}

export async function saveCardImage(cardId: ScrollableHashId) {
  const targetNode = document.getElementById(cardId) as HTMLElement
  const footer = targetNode?.querySelector('footer')

  if (footer && targetNode) {
    const divider = document.createElement('hr')
    divider.classList.add(
      'w-full',
      'border-b',
      'border-solid',
      'border-dividerGrey',
    )
    divider.style.height = '0px'
    footer.parentNode?.insertBefore(divider, footer)
    const p = document.createElement('p')
    p.innerHTML = CITATION_APA
    footer?.appendChild(p)
  }

  return domtoimage
    .toPng(targetNode, {
      scale: 3,
      filter: hideElementsForScreenshot,
    })
    .then((dataUrl: string) => {
      const link = document.createElement('a')
      link.download = 'my-image-name.png'
      link.href = dataUrl
      link.click()
    })
    .catch((error: Error) => {
      console.error('oops, something went wrong!', error)
    })
}
