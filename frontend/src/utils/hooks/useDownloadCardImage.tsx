import { createRef, useState, useEffect } from 'react'
import html2canvas from 'html2canvas'
import { createFileName } from 'use-react-screenshot'
import AppBarLogo from '../../assets/AppbarLogo.png'
import sass from '../../styles/variables.module.scss'

const CITATION_X = 31
const CITATION_FONT_SIZE = 22
const CITATION_FONT_STYLE = '"Inter",sans-serif'

// const WATERMARK_X = 10
// const WATERMARK_Y = 10
const WATERMARK_WIDTH = 75
const WATERMARK_HEIGHT = 75

const LOGO_TEXT = 'Health Equity Tracker'
const LOGO_FONT_COLOR = sass.altGreen
const LOGO_FONT_SIZE = 30
const LOGO_FONT_STYLE = '"DM Sans", sans-serif'

const TOP_PADDING = 50

export function useDownloadCardImage(
  cardTitle: string,
  hiddenElements: string[] = [],
  dropdownOpen?: boolean,
  scrollToHash: string = ''
) {
  const screenshotTargetRef = createRef<HTMLDivElement>()
  const [dropdownElement, setDropdownElement] = useState<HTMLElement | null>(
    null
  )
  const dropdownElementIds = [
    '#alt-table-view',
    '#alt-table-view-2',
    '#highest-lowest-list',
    '#highest-lowest-list-2',
  ]
  const urlWithoutHash = window.location.href.split('#')[0]
  const urlWithHash = `${urlWithoutHash}#${scrollToHash}`

  useEffect(() => {
    const element = dropdownElementIds
      .map((dropdownId) =>
        screenshotTargetRef.current?.querySelector(dropdownId)
      )
      .find((element) => element !== null) as HTMLElement

    setDropdownElement(element)
  }, [screenshotTargetRef])

  function download(
    canvas: HTMLCanvasElement,
    { name = cardTitle, extension = 'png' } = {}
  ) {
    const combinedCanvas = document.createElement('canvas')
    combinedCanvas.width = canvas.width
    combinedCanvas.height =
      canvas.height + CITATION_FONT_SIZE + 10 + TOP_PADDING
    const context = combinedCanvas.getContext('2d')

    const WATERMARK_X = canvas.width - WATERMARK_WIDTH - 320
    const WATERMARK_Y = canvas.height - 10

    const LOGO_TEXT_X = WATERMARK_X + WATERMARK_WIDTH + 10
    const LOGO_TEXT_Y = WATERMARK_Y + WATERMARK_HEIGHT / 2

    const logoImage = new Image()
    logoImage.src = AppBarLogo

    if (context) {
      // Fill the top area with white
      context.fillStyle = sass.white
      context.fillRect(0, 0, combinedCanvas.width, TOP_PADDING)

      // Draw the screenshot onto the combined canvas
      context.drawImage(canvas, 0, TOP_PADDING)

      // Draw the citation background
      const citationBackgroundHeight = CITATION_FONT_SIZE + 10
      context.fillStyle = sass.white
      context.fillRect(
        0,
        combinedCanvas.height - citationBackgroundHeight,
        combinedCanvas.width,
        citationBackgroundHeight
      )

      // Save the original globalAlpha value
      const originalAlpha = context.globalAlpha

      // Set opacity for watermark and logo
      context.globalAlpha = 0.4

      // Draw the watermark and logo
      context.drawImage(
        logoImage,
        WATERMARK_X,
        WATERMARK_Y,
        WATERMARK_WIDTH,
        WATERMARK_HEIGHT
      )
      context.font = `${LOGO_FONT_SIZE}px ${LOGO_FONT_STYLE}`
      context.fillStyle = LOGO_FONT_COLOR
      context.textBaseline = 'middle'
      context.fillText(LOGO_TEXT, LOGO_TEXT_X, LOGO_TEXT_Y)

      // Reset the globalAlpha to the original value
      context.globalAlpha = originalAlpha

      // Draw the citation
      const citationY = combinedCanvas.height - CITATION_FONT_SIZE - 5
      context.font = `${CITATION_FONT_SIZE}px ${CITATION_FONT_STYLE}`
      context.fillStyle = 'black'
      context.textBaseline = 'bottom'
      context.fillText(`${urlWithHash}`, CITATION_X, citationY)
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
