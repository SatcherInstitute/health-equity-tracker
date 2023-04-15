import { createRef } from 'react'
import { useScreenshot, createFileName } from 'use-react-screenshot'

export function useDownloadCardImage() {
  const screenshotTargetRef = createRef<any>()

  const [, takeScreenShot] = useScreenshot({
    type: 'image/jpeg',
    quality: 1.0,
  })

  function download(image: any, { name = 'img', extension = 'jpg' } = {}) {
    const a = document.createElement('a')
    a.href = image
    a.download = createFileName(extension, name)
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

  return [screenshotTargetRef, downloadTargetScreenshot]
}
