import { Backdrop, CircularProgress } from '@mui/material'
import type { Dispatch, SetStateAction } from 'react'

interface SimpleBackdropProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}

export default function SimpleBackdrop(props: SimpleBackdropProps) {
  function handleClose() {
    props.setOpen(false)
  }

  return (
    <div>
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={props.open}
        onClick={handleClose}
      >
        <CircularProgress color='inherit' />
      </Backdrop>
    </div>
  )
}
