import { ContentCopy } from '@mui/icons-material'
import type { PopoverElements } from '../../utils/hooks/usePopover'
import HetDialog from '../../styles/HetComponents/HetDialog'
import HetTerm from '../../styles/HetComponents/HetTerm'
import type { ScrollableHashId } from '../../utils/hooks/useStepObserver'
import SimpleBackdrop from '../../pages/ui/SimpleBackdrop'
import { useCardImage } from '../../utils/hooks/useCardImage'
import { HetCardExportMenuItem } from '../../styles/HetComponents/HetCardExportMenuItem'

interface CopyCardImageToClipboardButtonProps {
  popover: PopoverElements
  scrollToHash: ScrollableHashId
}

export function CopyCardImageToClipboardButton(
  props: CopyCardImageToClipboardButtonProps,
) {
  const {
    cardName,
    isThinking,
    setIsThinking,
    imgDataUrl,
    hetDialogOpen,
    handleCopyImgToClipboard,
    handleClose,
  } = useCardImage(props.popover, props.scrollToHash)

  return (
    <>
      <SimpleBackdrop open={isThinking} setOpen={setIsThinking} />
      <HetCardExportMenuItem
        onClick={handleCopyImgToClipboard}
        Icon={ContentCopy}
      >
        Copy Image To Clipboard
      </HetCardExportMenuItem>
      <HetDialog open={hetDialogOpen} handleClose={handleClose}>
        Copied <HetTerm>{cardName}</HetTerm> image to clipboard!
        {imgDataUrl && (
          <div className='mt-4 rounded-lg overflow-hidden border border-gray-200'>
            <img
              src={imgDataUrl}
              alt={`Preview of ${cardName}`}
              className='w-full h-auto max-w-tiny object-contain bg-gray-50'
            />
          </div>
        )}
      </HetDialog>
    </>
  )
}
