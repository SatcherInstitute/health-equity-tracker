import ContentCopy from '@mui/icons-material/ContentCopy'
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
  errorOpen,
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
          <div className='mt-4 overflow-hidden'>
            <img
              src={imgDataUrl}
              alt={`Preview of ${cardName} ${imgTerm}`}
              className='h-auto max-h-150 w-full bg-alt-white object-contain'
            />
          </div>
        )}
      </HetSnackbar>
      <HetSnackbar open={errorOpen} handleClose={handleClose}>
        Unable to copy image. Please keep this tab focused and try again.
      </HetSnackbar>
    </>
  )
}
