import { createRef } from 'react'
import html2canvas from 'html2canvas'
import { createFileName } from 'use-react-screenshot'
import AppBarLogo from '../../assets/AppbarLogo.png'

const WATERMARK_X = 10
const WATERMARK_Y = 10
const WATERMARK_WIDTH = 50
const WATERMARK_HEIGHT = 50

export function useDownloadCardImage(cardTitle: string, hiddenElements: string[] = []) {
  const screenshotTargetRef = createRef<HTMLDivElement>();

  function download(canvas: HTMLCanvasElement, { name = cardTitle, extension = 'png' } = {}) {
    // Create a new canvas to combine the screenshot and watermark
    const combinedCanvas = document.createElement('canvas')
    combinedCanvas.width = canvas.width
    combinedCanvas.height = canvas.height
    const context = combinedCanvas.getContext('2d')

    // Draw the screenshot on the combined canvas
    context?.drawImage(canvas, 0, 0)

    // Load the logo image
    const logoImage = new Image()
    logoImage.src = AppBarLogo

    // Position the logo as a watermark on the combined canvas
    logoImage.onload = () => {
      // Adjust the opacity of the watermark
      context && (context.globalAlpha = 0.5)
      context?.drawImage(logoImage, WATERMARK_X, WATERMARK_Y, WATERMARK_WIDTH, WATERMARK_HEIGHT)

      // Convert the combined canvas to an image
      const image = combinedCanvas.toDataURL('image/png')

      // Create a download link for the screenshot with watermark
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
      // Hide specified elements temporarily for the screenshot
      hiddenElements.forEach((element) => {
        const elementToHide = screenshotTargetRef.current?.querySelector(element) as HTMLElement | null
        if (elementToHide) {
          elementToHide.style.visibility = 'hidden'
        }
      })

      const canvas = await html2canvas(screenshotTargetRef.current as HTMLElement, {
        logging: true,
        useCORS: true,
      })

      // Restore the original visibility of hidden elements
      hiddenElements.forEach((element) => {
        const elementToHide = screenshotTargetRef.current?.querySelector(element) as HTMLElement | null
        if (elementToHide) {
          elementToHide.style.visibility = 'visible'
        }
      })

      // Download the screenshot with watermark
      download(canvas)

      return true
    } catch (e) {
      return false
    }
  }

  return [screenshotTargetRef, downloadTargetScreenshot] as const;
}
