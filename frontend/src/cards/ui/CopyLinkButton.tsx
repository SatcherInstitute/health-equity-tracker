import type { ScrollableHashId } from '../../utils/hooks/useStepObserver'
import LinkIcon from '@mui/icons-material/Link'
import type { PopoverElements } from '../../utils/hooks/usePopover'
import HetDialog from '../../styles/HetComponents/HetDialog'
import HetTerm from '../../styles/HetComponents/HetTerm'
import { useCardImage } from '../../utils/hooks/useCardImage'
import { HetCardExportMenuItem } from '../../styles/HetComponents/HetCardExportMenuItem'

interface CopyLinkButtonProps {
  popover: PopoverElements
  scrollToHash: ScrollableHashId
  urlWithHash: string
}

export default function CopyLinkButton(props: CopyLinkButtonProps) {
  const { cardName, hetDialogOpen, handleCopyLink, handleClose } = useCardImage(
    props.popover,
    props.scrollToHash,
    props.urlWithHash,
  )

  return (
    <>
      <HetCardExportMenuItem Icon={LinkIcon} onClick={handleCopyLink}>
        Copy Card Link
      </HetCardExportMenuItem>
      <HetDialog open={hetDialogOpen} handleClose={handleClose}>
        Direct link to <HetTerm>{cardName}</HetTerm> copied to clipboard!
      </HetDialog>
    </>
  )
}
