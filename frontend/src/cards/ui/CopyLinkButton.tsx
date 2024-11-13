import LinkIcon from '@mui/icons-material/Link'
import { HetCardExportMenuItem } from '../../styles/HetComponents/HetCardExportMenuItem'
import HetSnackbar from '../../styles/HetComponents/HetSnackbar'
import HetTerm from '../../styles/HetComponents/HetTerm'
import { useCardImage } from '../../utils/hooks/useCardImage'
import type { PopoverElements } from '../../utils/hooks/usePopover'
import type { ScrollableHashId } from '../../utils/hooks/useStepObserver'

interface CopyLinkButtonProps {
  popover: PopoverElements
  scrollToHash: ScrollableHashId
}

export default function CopyLinkButton(props: CopyLinkButtonProps) {
  const { cardName, confirmationOpen, handleCopyLink, handleClose } =
    useCardImage(props.popover, props.scrollToHash)

  return (
    <>
      <HetCardExportMenuItem
        spanClassName='py-0 pr-4'
        iconClassName='h-12'
        className='py-0 pr-0'
        Icon={LinkIcon}
        onClick={handleCopyLink}
      >
        Copy Card Link
      </HetCardExportMenuItem>
      <HetSnackbar open={confirmationOpen} handleClose={handleClose}>
        Direct link to <HetTerm>{cardName}</HetTerm> copied to clipboard!
      </HetSnackbar>
    </>
  )
}
