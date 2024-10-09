import { SaveAlt } from '@mui/icons-material'
import SimpleBackdrop from '../../pages/ui/SimpleBackdrop'
import { HetCardExportMenuItem } from '../../styles/HetComponents/HetCardExportMenuItem'
import { useCardImage } from '../../utils/hooks/useCardImage'
import type { PopoverElements } from '../../utils/hooks/usePopover'
import type { ScrollableHashId } from '../../utils/hooks/useStepObserver'

interface DownloadCardImageButtonProps {
  popover: PopoverElements
  scrollToHash: ScrollableHashId
  reportTitle: string
}

export function DownloadCardImageButton(props: DownloadCardImageButtonProps) {
  const cardSpecificReportTitle = `${props.scrollToHash.toUpperCase()} ${props.reportTitle}`
  const { isThinking, setIsThinking, handleDownloadImg, handleDownloadRowImg } =
    useCardImage(props.popover, props.scrollToHash, cardSpecificReportTitle)

  const isCompareMode = window.location.href.includes('compare')

  return (
    <>
      <SimpleBackdrop open={isThinking} setOpen={setIsThinking} />
      <HetCardExportMenuItem
        Icon={SaveAlt}
        onClick={isCompareMode ? handleDownloadRowImg : handleDownloadImg}
      >
        Save Image
      </HetCardExportMenuItem>
    </>
  )
}
