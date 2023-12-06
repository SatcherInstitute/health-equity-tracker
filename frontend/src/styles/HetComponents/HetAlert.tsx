import { Alert, AlertTitle, type AlertColor } from '@mui/material'
import { type ReactNode } from 'react'
import FlagIcon from '@mui/icons-material/Flag'
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'

export type HetAlertKind =
  | 'data-integrity'
  | 'health-crisis'
  | 'text-only'
  | 'helpful-info'

interface HetAlertProps {
  children: ReactNode
  title?: string
  icon?: ReactNode
  id?: string
  className?: string
  kind?: HetAlertKind
}

export default function HetAlert(props: HetAlertProps) {
  const { severity, icon } = getMuiAlertProps(props.kind)

  return (
    <Alert
      id={props.id}
      severity={severity}
      className={`rounded ${props.className ?? ''}`}
      role='note'
      icon={props.icon ?? icon}
    >
      {props.title && <AlertTitle>{props.title}</AlertTitle>}
      {props.children}
    </Alert>
  )
}

interface AlertProps {
  severity: AlertColor
  icon: ReactNode
}

/* Accepts an optional HetAlertKind and returns needed MUI AlertProps object for the icon and severity */
function getMuiAlertProps(kind: HetAlertKind | undefined): AlertProps {
  switch (kind) {
    case 'text-only':
      return { severity: 'info', icon: <></> }
    case 'data-integrity':
      return { severity: 'warning', icon: <ReportProblemOutlinedIcon /> }
    case 'health-crisis':
      return { severity: 'error', icon: <FlagIcon /> }
    // default is 'helpful-info'
    case 'helpful-info':
    default:
      return { severity: 'info', icon: <InfoOutlinedIcon /> }
  }
}
