import { useState } from 'react'
import SimpleBackdrop from '../../pages/ui/SimpleBackdrop'

interface DownloadCardImageButtonProps {
  downloadTargetScreenshot: () => Promise<boolean>
}

export function DownloadCardImageButton(props: DownloadCardImageButtonProps) {
  const [isThinking, setIsThinking] = useState(false)

  async function takeScreenshot(this: any) {
    setIsThinking(true)
    setIsThinking(!(await props.downloadTargetScreenshot()))
  }

  return (
    <>
      <SimpleBackdrop open={isThinking} setOpen={setIsThinking} />

      {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
      <button onClick={takeScreenshot}>Export card image</button>
    </>
  )
}
