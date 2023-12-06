import { Alert, AlertTitle, type AlertColor } from '@mui/material'
import { type ReactNode } from 'react'
import FlagIcon from '@mui/icons-material/Flag'
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import DangerousOutlinedIcon from '@mui/icons-material/DangerousOutlined'

export type HetNoticeKind =
  | 'data-integrity'
  | 'health-crisis'
  | 'text-only'
  | 'helpful-info'
  | 'technical-error'

interface HetNoticeProps {
  children: ReactNode
  title?: string
  icon?: ReactNode
  id?: string
  className?: string
  kind?: HetNoticeKind
  variant?: 'filled' | 'outlined'
}

export default function HetNotice(props: HetNoticeProps) {
  const { severity, icon, variant } = getMuiAlertProps(props.kind)

  return (
    <Alert
      id={props.id}
      severity={severity}
      className={`rounded mx-2 my-4 lg:mx-5 ${props.className ?? ''}`}
      role='note'
      icon={props.icon ?? icon}
      variant={variant}
    >
      {props.title && <AlertTitle>{props.title}</AlertTitle>}
      {props.children}
    </Alert>
  )
}

interface AlertProps {
  severity: AlertColor
  icon: ReactNode
  variant?: 'outlined'
}

/* Accepts an optional HetNoticeKind and returns needed MUI AlertProps object for the icon and severity */
function getMuiAlertProps(kind: HetNoticeKind | undefined): AlertProps {
  switch (kind) {
    case 'text-only':
      return { severity: 'success', icon: <></>, variant: 'outlined' }
    case 'data-integrity':
      return { severity: 'warning', icon: <ReportProblemOutlinedIcon /> }
    case 'health-crisis':
      return { severity: 'error', icon: <FlagIcon /> }
    case 'technical-error':
      return { severity: 'error', icon: <DangerousOutlinedIcon /> }
    // default is 'helpful-info'
    case 'helpful-info':
    default:
      return { severity: 'info', icon: <InfoOutlinedIcon /> }
  }
}
