import { Alert, AlertTitle, type AlertColor } from '@mui/material'
import { type ReactNode } from 'react'

interface HetAlertProps {
  children: ReactNode
  title?: string
  severity?: AlertColor
  id?: string
  icon?: ReactNode
}

export default function HetAlert(props: HetAlertProps) {
  return (
    <Alert
      id={props.id}
      severity={props.severity ?? 'info'}
      className='rounded'
      role='note'
      icon={props.icon}
    >
      {props.title && <AlertTitle>{props.title}</AlertTitle>}
      {props.children}
    </Alert>
  )
}
