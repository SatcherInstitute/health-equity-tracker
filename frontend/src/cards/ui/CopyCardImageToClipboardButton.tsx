import { useState } from 'react'
import { ContentCopy } from '@mui/icons-material'
import ListItemIcon from '@mui/material/ListItemIcon'
import MenuItem from '@mui/material/MenuItem'
import SimpleBackdrop from '../../pages/ui/SimpleBackdrop'
import type { PopoverElements } from '../../utils/hooks/usePopover'
import HetDialog from '../../styles/HetComponents/HetDialog'
import HetTerm from '../../styles/HetComponents/HetTerm'
import { reportProviderSteps } from '../../reports/ReportProviderSteps'
import type { ScrollableHashId } from '../../utils/hooks/useStepObserver'

interface CopyCardImageToClipboardButtonProps {
  popover: PopoverElements
  copyTargetScreenshot: () => Promise<boolean | any>
  scrollToHash: ScrollableHashId
  isMulti?: boolean
}

export function CopyCardImageToClipboardButton(
  props: CopyCardImageToClipboardButtonProps,
) {
  const [confirmationOpen, setConfirmationOpen] = useState(false)
  const cardName = reportProviderSteps[props.scrollToHash].label
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  function handleClick() {
    async function asyncHandleClick() {
      const dataUrl = await props.copyTargetScreenshot()

      if (typeof dataUrl === 'string') {
        setPreviewUrl(dataUrl)
      }
      setConfirmationOpen(true)
    }
    asyncHandleClick().catch((error) => error)
  }

  function handleClose() {
    props.popover.close()
    setConfirmationOpen(false)
    setPreviewUrl(null)
  }

  return (
    <>
      {/* <SimpleBackdrop open={isThinking} setOpen={setIsThinking} /> */}
      <MenuItem className='pl-3' onClick={handleClick}>
        <ListItemIcon className='flex items-center px-2 py-1'>
          <ContentCopy className='mx-1 w-8' />
          {!props.isMulti && (
            <div className='pl-1 text-altBlack'>Copy Image To Clipboard</div>
          )}
        </ListItemIcon>
      </MenuItem>
      <HetDialog open={confirmationOpen} handleClose={handleClose}>
        Copied <HetTerm>{cardName}</HetTerm> image to clipboard!
        {previewUrl && (
          <div className='mt-4 rounded-lg overflow-hidden border border-gray-200'>
            <img
              src={previewUrl}
              alt={`Preview of ${cardName}`}
              className='w-full h-auto max-w-tiny object-contain bg-gray-50'
            />
          </div>
        )}
      </HetDialog>
    </>
  )
}
