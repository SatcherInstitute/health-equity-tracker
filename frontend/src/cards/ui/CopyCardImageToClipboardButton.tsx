import { ContentCopy } from '@mui/icons-material'
import SimpleBackdrop from '../../pages/ui/SimpleBackdrop'
import { HetCardExportMenuItem } from '../../styles/HetComponents/HetCardExportMenuItem'
import HetSnackbar from '../../styles/HetComponents/HetSnackbar'
import HetTerm from '../../styles/HetComponents/HetTerm'
import { useCardImage } from '../../utils/hooks/useCardImage'
import type { PopoverElements } from '../../utils/hooks/usePopover'
import type { ScrollableHashId } from '../../utils/hooks/useStepObserver'

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
    confirmationOpen,
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
      <HetSnackbar open={confirmationOpen} handleClose={handleClose}>
        Copied <HetTerm>{cardName}</HetTerm> image to clipboard!
        {imgDataUrl && (
          <div className='mt-4 rounded-lg overflow-hidden border border-gray-200'>
            <img
              src={imgDataUrl}
              alt={`Preview of ${cardName}`}
              // className='w-full h-auto max-w-tiny object-contain bg-gray-50'
              className='w-full h-auto max-w-exploreDataPage object-contain bg-gray-50'
            />
          </div>
        )}
      </HetSnackbar>
    </>
  )
}
