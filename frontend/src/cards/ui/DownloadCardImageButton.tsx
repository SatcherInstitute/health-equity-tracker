import { SaveAlt } from '@mui/icons-material'
import SimpleBackdrop from '../../pages/ui/SimpleBackdrop'
import { HetCardExportMenuItem } from '../../styles/HetComponents/HetCardExportMenuItem'
import { useCardImage } from '../../utils/hooks/useCardImage'
import type { PopoverElements } from '../../utils/hooks/usePopover'
import type { ScrollableHashId } from '../../utils/hooks/useStepObserver'

interface DownloadCardImageButtonProps {
  popover: PopoverElements
  scrollToHash: ScrollableHashId
}

export function DownloadCardImageButton(props: DownloadCardImageButtonProps) {
  const { isThinking, setIsThinking, handleDownloadImg } = useCardImage(
    props.popover,
    props.scrollToHash,
  )

  return (
    <>
      <SimpleBackdrop open={isThinking} setOpen={setIsThinking} />
      <HetCardExportMenuItem Icon={SaveAlt} onClick={handleDownloadImg}>
        Save Image
      </HetCardExportMenuItem>
    </>
  )
}
