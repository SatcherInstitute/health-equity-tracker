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
    handleCopyRowImgToClipboard,
    handleClose,
  } = useCardImage(props.popover, props.scrollToHash)

  const isCompareMode = window.location.href.includes('compare')
  const imgTerm = isCompareMode ? 'Side-by-Side Images' : 'Image'

  return (
    <>
      <SimpleBackdrop open={isThinking} setOpen={setIsThinking} />
      <HetCardExportMenuItem
        spanClassName='py-0 pr-4'
        iconClassName='h-12'
        className='py-0 pr-0'
        onClick={
          isCompareMode ? handleCopyRowImgToClipboard : handleCopyImgToClipboard
        }
        Icon={ContentCopy}
      >
        Copy {imgTerm} To Clipboard
      </HetCardExportMenuItem>
      <HetSnackbar open={confirmationOpen} handleClose={handleClose}>
        Copied <HetTerm>{cardName}</HetTerm> {imgTerm} to clipboard!
        {imgDataUrl && (
          <div className='mt-4 rounded-lg overflow-hidden border border-gray-200'>
            <img
              src={imgDataUrl}
              alt={`Preview of ${cardName} ${imgTerm}`}
              className='w-full h-auto max-h-sm object-contain bg-gray-50'
            />
          </div>
        )}
      </HetSnackbar>
    </>
  )
}
