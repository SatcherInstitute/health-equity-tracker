import { createRef } from 'react'
import html2canvas from 'html2canvas'
import { createFileName } from 'use-react-screenshot'
import AppBarLogo from '../../assets/AppbarLogo.png'
import sass from '../../styles/variables.module.scss'
import { CITATION_APA } from '../../pages/DataCatalog/MethodologyTab'

const WATERMARK_X = 10
const WATERMARK_Y = 10
const WATERMARK_WIDTH = 100
const WATERMARK_HEIGHT = 100

const LOGO_TEXT = 'Health Equity Tracker'
const LOGO_TEXT_X = WATERMARK_X + WATERMARK_WIDTH + 10
const LOGO_TEXT_Y = WATERMARK_Y + WATERMARK_HEIGHT / 2
const LOGO_FONT_COLOR = sass.altGreen
const LOGO_FONT_SIZE = 30
const LOGO_FONT_STYLE = '"DM Sans", sans-serif'

const CITATION_X = 31
const CITATION_FONT_SIZE = 22
const CITATION_FONT_STYLE = '"Inter",sans-serif'

const TOP_PADDING = 50

export function useDownloadCardImage(cardTitle: string, hiddenElements: string[] = []) {
  const screenshotTargetRef = createRef<HTMLDivElement>()

  function download(canvas: HTMLCanvasElement, { name = cardTitle, extension = 'png' } = {}) {
    const combinedCanvas = document.createElement('canvas')
    combinedCanvas.width = canvas.width
    combinedCanvas.height = canvas.height + CITATION_FONT_SIZE + 10 + TOP_PADDING
    const context = combinedCanvas.getContext('2d')

    const logoImage = new Image()
    logoImage.src = AppBarLogo

    if (context) {
      // Draw the screenshot onto the combined canvas
      context.fillStyle = 'white'
      context.fillRect(0, 0, combinedCanvas.width, TOP_PADDING)

      context.drawImage(canvas, 0, TOP_PADDING)

      // Draw the citation background
      const citationBackgroundHeight = CITATION_FONT_SIZE + 10
      context.fillStyle = 'white'
      context.fillRect(0, combinedCanvas.height - citationBackgroundHeight, combinedCanvas.width, citationBackgroundHeight)

      // Save the original globalAlpha value
      const originalAlpha = context.globalAlpha

      // Set opacity for watermark and logo
      context.globalAlpha = 0.7

      // Draw the watermark and logo
      context.drawImage(logoImage, WATERMARK_X, WATERMARK_Y, WATERMARK_WIDTH, WATERMARK_HEIGHT)
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
      context.fillText(`Citation: ${CITATION_APA}`, CITATION_X, citationY)
    }

    const image = combinedCanvas.toDataURL('image/png')

    const a = document.createElement('a')
    a.href = image
    a.download = createFileName(
      extension,
      `${name} from Health Equity Tracker ${new Date().toLocaleDateString(undefined, {
        month: 'short',
        year: 'numeric',
      })}`
    )
    a.click()
  }

  async function downloadTargetScreenshot() {
    try {
      // Hide specified elements for the screenshot
      hiddenElements.forEach((element) => {
        const elementToHide = screenshotTargetRef.current?.querySelector(element) as HTMLElement
        if (elementToHide) elementToHide.style.visibility = 'hidden'
      })

      const canvas = await html2canvas(screenshotTargetRef.current as HTMLElement, {
        logging: true,
        useCORS: true,
      })
      // Restore specified elements for the screenshot
      hiddenElements.forEach((element) => {
        const elementToHide = screenshotTargetRef.current?.querySelector(element) as HTMLElement
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
