import CloseIcon from '@mui/icons-material/Close'
import { Dialog, DialogContent, IconButton } from '@mui/material'
import type React from 'react'

interface HetModalProps {
  open: boolean
  onClose: () => void
  imageUrl: string
  altText: string
}

const HetModal: React.FC<HetModalProps> = ({
  open,
  onClose,
  imageUrl,
  altText,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth='lg' fullWidth>
      <DialogContent className='flex items-center justify-center p-4'>
        <IconButton
          aria-label='close'
          onClick={onClose}
          className='absolute top-2 right-2'
        >
          <CloseIcon />
        </IconButton>
        <img
          src={imageUrl}
          alt={altText}
          className='max-h-[80vh] max-w-full rounded-lg shadow-lg'
        />
      </DialogContent>
    </Dialog>
  )
}

export default HetModal
