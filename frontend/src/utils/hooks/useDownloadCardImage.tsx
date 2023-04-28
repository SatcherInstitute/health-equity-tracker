import { createRef } from 'react'
import { useScreenshot, createFileName } from 'use-react-screenshot'

export function useDownloadCardImage(cardTitle: string) {
  const screenshotTargetRef = createRef<any>()

  const [, takeScreenShot] = useScreenshot({
    type: 'image/png',
    quality: 1.0,
  })

  function download(image: any, { name = cardTitle, extension = 'png' } = {}) {
    const a = document.createElement('a')
    a.href = image
    a.download = createFileName(
      extension,
      `${name} from Health Equity Tracker ${new Date().toLocaleDateString(
        undefined,
        { month: 'short', year: 'numeric' }
      )}`
    )
    a.click()
  }

  async function downloadTargetScreenshot() {
    try {
      await takeScreenShot(screenshotTargetRef.current).then(download)
      return true
    } catch (e) {
      return false
    }
  }

  // use `as const` to have ts treat this as a Tuple with each item specifically typed, rather than an array with all types as options for all items
  return [screenshotTargetRef, downloadTargetScreenshot] as const
}
