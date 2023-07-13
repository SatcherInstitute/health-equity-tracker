import { createRef } from 'react'
import html2canvas from 'html2canvas'
import { createFileName } from 'use-react-screenshot'
import AppBarLogo from '../../assets/AppbarLogo.png'
import sass from '../../styles/variables.module.scss'

const WATERMARK_X = 10
const WATERMARK_Y = 10
const WATERMARK_WIDTH = 50
const WATERMARK_HEIGHT = 50

const LOGO_TEXT = 'Health Equity Tracker'
const LOGO_TEXT_X = WATERMARK_X + WATERMARK_WIDTH + 10
const LOGO_TEXT_Y = WATERMARK_Y + WATERMARK_HEIGHT / 2
const LOGO_FONT_COLOR = sass.altGreen
const LOGO_FONT_SIZE = 16
const LOGO_FONT_STYLE = 'DM Sans, sans-serif'

const CITATION_TEXT = 'Citation: Health Equity Tracker. (2023). Satcher Health Leadership Institute. Morehouse School of Medicine. https://healthequitytracker.org.'
const CITATION_X = 10
const CITATION_FONT_SIZE = 10

export function useDownloadCardImage(cardTitle: string, hiddenElements: string[] = []) {
  const screenshotTargetRef = createRef<HTMLDivElement>()

  function download(canvas: HTMLCanvasElement, { name = cardTitle, extension = 'png' } = {}) {
    // Canvas for watermark, logo text, & citation
    const combinedCanvas = document.createElement('canvas')
    combinedCanvas.width = canvas.width
    combinedCanvas.height = canvas.height
    const context = combinedCanvas.getContext('2d')

    context?.drawImage(canvas, 0, 0)

    // Load the logo image
    const logoImage = new Image()
    logoImage.src = AppBarLogo

    if (context) {
      context.font = `${LOGO_FONT_SIZE}px ${LOGO_FONT_STYLE}`
      context.fillStyle = LOGO_FONT_COLOR
      context.textBaseline = 'middle'
      context.fillText(LOGO_TEXT, LOGO_TEXT_X, LOGO_TEXT_Y)

      const CITATION_Y = canvas.height - 20
      context.font = `${CITATION_FONT_SIZE}px ${LOGO_FONT_STYLE}`
      context.fillStyle = 'black'
      context.textBaseline = 'bottom'
      context.fillText(CITATION_TEXT, CITATION_X, CITATION_Y)

    }

    // Position the logo as a watermark on the combined canvas
    logoImage.onload = () => {
      context?.drawImage(logoImage, WATERMARK_X, WATERMARK_Y, WATERMARK_WIDTH, WATERMARK_HEIGHT)
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
  }

  async function downloadTargetScreenshot() {
    try {
      // Hide specified elements for the screenshot
      hiddenElements.forEach((element) => {
        const elementToHide = document.getElementById(element)
        if (elementToHide) elementToHide.style.visibility = 'hidden'
      })

      const canvas = await html2canvas(screenshotTargetRef.current as HTMLElement, {
        logging: true,
        useCORS: true,
      })

      // Restore visibility of hidden elements
      hiddenElements.forEach((element) => {
        const elementToHide = document.getElementById(element)
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
