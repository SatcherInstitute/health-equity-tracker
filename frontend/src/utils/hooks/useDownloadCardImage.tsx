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
const LOGO_FONT_SIZE = 24
const LOGO_FONT_STYLE = '"DM Sans", sans-serif'
const LOGO_TEXT = 'Health Equity Tracker'
const TOP_PADDING = 10
const BOTTOM_PADDING = 120

const URL_FONT_SIZE = 14
const URL_FONT_STYLE = '"Inter",sans-serif'

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
    combinedCanvas.height =
      TOP_PADDING + canvas.height + URL_FONT_SIZE + BOTTOM_PADDING

    const context = combinedCanvas.getContext('2d')
    const urlBaseline = combinedCanvas.height - 2 * URL_FONT_SIZE
    const logoBaseline = combinedCanvas.height - 4 * URL_FONT_SIZE
    const hrBaseline = combinedCanvas.height - 7 * URL_FONT_SIZE

    if (context) {
      // overall text styling
      context.textBaseline = 'bottom'
      context.textAlign = 'center'

      // Fill the top and bottom areas with white
      context.fillStyle = sass.white
      context.fillRect(0, 0, combinedCanvas.width, TOP_PADDING)
      context.fillRect(
        0,
        combinedCanvas.height - BOTTOM_PADDING - URL_FONT_SIZE,
        combinedCanvas.width,
        combinedCanvas.height
      )

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
      context.globalAlpha = 1

      // draw horizontal divider
      context.beginPath()
      context.moveTo(canvas.width * 0.2, hrBaseline)
      context.lineTo(canvas.width * 0.8, hrBaseline)
      context.lineWidth = 1
      context.strokeStyle = LOGO_FONT_COLOR
      context.stroke()

      context.font = `${LOGO_FONT_SIZE}px ${LOGO_FONT_STYLE}`
      context.fillStyle = LOGO_FONT_COLOR
      context.fillText(LOGO_TEXT, canvas.width / 2, logoBaseline)

      // Reset the globalAlpha to the original value
      context.globalAlpha = originalAlpha

      // Draw the url
      context.font = `${URL_FONT_SIZE}px ${URL_FONT_STYLE}`
      context.fillStyle = 'black'
      context.fillText(
        urlWithHash,
        canvas.width / 2,
        urlBaseline,
        canvas.width - 40
      )
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
        if (elementToHide) {
          elementToHide.style.visibility = 'hidden'
        }
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
