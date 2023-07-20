import { createRef, useState, useEffect } from 'react'
import html2canvas from 'html2canvas'
import { createFileName } from 'use-react-screenshot'
import sass from '../../styles/variables.module.scss'

const DROPDOWN_ELEMENT_IDS = [
  '#alt-table-view',
  '#alt-table-view-2',
  '#highest-lowest-list',
  '#highest-lowest-list-2',
]

const LOGO_FONT_COLOR = sass.altGreen
const LOGO_FONT_SIZE = 30
const LOGO_FONT_STYLE = '"DM Sans", sans-serif'
const LOGO_TEXT = 'Health Equity Tracker'

const TOP_PADDING = 50

const URL_FONT_SIZE = 22
const URL_FONT_STYLE = '"Inter",sans-serif'
const URL_X = 32

export function useDownloadCardImage(
  cardTitle: string,
  hiddenElements: string[] = [],
  dropdownOpen?: boolean,
  scrollToHash: string = ''
) {
  const screenshotTargetRef = createRef<HTMLDivElement>()
  const [dropdownElement, setDropdownElement] = useState<HTMLElement>()

  const urlWithoutHash = window.location.href.split('#')[0]
  const urlWithHash = `${urlWithoutHash}#${scrollToHash}`

  useEffect(() => {
    const element = DROPDOWN_ELEMENT_IDS.map((dropdownId) =>
      screenshotTargetRef.current?.querySelector(dropdownId)
    ).find((element) => element !== null) as HTMLElement

    setDropdownElement(element)
  }, [screenshotTargetRef])

  function download(
    canvas: HTMLCanvasElement,
    { name = cardTitle, extension = 'png' } = {}
  ) {
    const combinedCanvas = document.createElement('canvas')
    combinedCanvas.width = canvas.width
    combinedCanvas.height = canvas.height + URL_FONT_SIZE + 10 + TOP_PADDING

    const context = combinedCanvas.getContext('2d')

    const logoTextX = canvas.width - 310

    const urlLogoBaseline = combinedCanvas.height - URL_FONT_SIZE

    if (context) {
      // Fill the top area with white
      context.fillStyle = sass.white
      context.fillRect(0, 0, combinedCanvas.width, TOP_PADDING)

      // Draw the screenshot onto the combined canvas
      context.drawImage(canvas, 0, TOP_PADDING)

      const urlPaddingHeight = URL_FONT_SIZE + 10
      context.fillStyle = sass.white
      context.fillRect(
        0,
        combinedCanvas.height - urlPaddingHeight,
        combinedCanvas.width,
        urlPaddingHeight
      )

      // Save the original globalAlpha value
      const originalAlpha = context.globalAlpha

      // Set opacity for logo text
      context.globalAlpha = 0.4

      context.font = `${LOGO_FONT_SIZE}px ${LOGO_FONT_STYLE}`
      context.fillStyle = LOGO_FONT_COLOR
      context.textBaseline = 'bottom'
      context.fillText(LOGO_TEXT, logoTextX, urlLogoBaseline)

      // Reset the globalAlpha to the original value
      context.globalAlpha = originalAlpha

      // Draw the url
      context.font = `${URL_FONT_SIZE}px ${URL_FONT_STYLE}`
      context.fillStyle = 'black'
      context.textBaseline = 'bottom'
      context.fillText(`${urlWithHash}`, URL_X, urlLogoBaseline)
    }

    const image = combinedCanvas.toDataURL('image/png')

    const a = document.createElement('a')
    a.href = image
    a.download = createFileName(
      extension,
      `${name} from Health Equity Tracker ${new Date().toLocaleDateString(
        undefined,
        {
          month: 'short',
          year: 'numeric',
        }
      )}`
    )
    a.click()
  }

  async function downloadTargetScreenshot() {
    try {
      // Hide specified elements for the screenshot
      hiddenElements.forEach((element) => {
        const elementToHide = screenshotTargetRef.current?.querySelector(
          element
        ) as HTMLElement
        if (elementToHide) elementToHide.style.visibility = 'hidden'
      })

      if (dropdownElement) {
        dropdownElement.style.visibility = dropdownOpen ? 'visible' : 'hidden'
      }

      const canvas = await html2canvas(
        screenshotTargetRef.current as HTMLElement,
        {
          logging: true,
          useCORS: true,
        }
      )

      if (dropdownElement) {
        dropdownElement.style.visibility = 'visible'
      }

      // Restore specified elements for the screenshot
      hiddenElements.forEach((element) => {
        const elementToHide = screenshotTargetRef.current?.querySelector(
          element
        ) as HTMLElement
        if (elementToHide) elementToHide.style.visibility = 'visible'
      })

      download(canvas)

      return true
    } catch (e) {
      return false
    }
  }

  return [screenshotTargetRef, downloadTargetScreenshot] as const
}
