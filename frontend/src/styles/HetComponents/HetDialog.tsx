import { Snackbar, Alert, Slide } from '@mui/material'
import type { ReactNode } from 'react'

interface HetDialogProps {
  children?: ReactNode
  open: boolean
  handleClose: () => void
}
export default function HetDialog(props: HetDialogProps) {
  return (
    <Snackbar
      open={props.open}
      autoHideDuration={5000}
      onClose={props.handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      TransitionComponent={SlideTransition}
    >
      <Alert
        onClose={props.handleClose}
        className='border border-solid border-barChartLight'
        role='alert'
      >
        {props.children}
      </Alert>
    </Snackbar>
  )
}

function SlideTransition(props: any) {
  return <Slide {...props} direction='right' />
}
