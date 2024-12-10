import type React from 'react'
import { Dialog, DialogContent, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

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
      <DialogContent className='flex justify-center items-center p-4'>
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
          className='max-w-full max-h-[80vh] rounded-lg shadow-lg'
        />
      </DialogContent>
    </Dialog>
  )
}

export default HetModal
