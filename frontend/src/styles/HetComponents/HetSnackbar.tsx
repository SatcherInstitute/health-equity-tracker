import { Alert, Slide, Snackbar } from '@mui/material'
import type { ReactNode } from 'react'

interface HetSnackbarProps {
  children?: ReactNode
  open: boolean
  handleClose: () => void
}
export default function HetSnackbar(props: HetSnackbarProps) {
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
        className='border border-barChartLight border-solid'
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
