import DangerousOutlinedIcon from '@mui/icons-material/DangerousOutlined'
import FlagIcon from '@mui/icons-material/Flag'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined'
import { Alert, type AlertColor, AlertTitle } from '@mui/material'
import type { ReactNode } from 'react'

export type HetNoticeKind =
  | 'data-integrity'
  | 'health-crisis'
  | 'text-only'
  | 'helpful-info'
  | 'technical-error'
  | 'quote'

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
      className={`mx-2 my-4 rounded lg:mx-5 lg:my-10 ${props.className ?? ''}`}
      role='note'
      icon={props.icon ?? icon}
      variant={variant}
    >
      {props.title && (
        <AlertTitle
          className={
            props.kind === 'quote'
              ? 'font-bold text-small italic md:text-title'
              : ''
          }
        >
          {props.title}
        </AlertTitle>
      )}
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
    case 'quote':
      return { severity: 'info', icon: <></>, variant: 'outlined' }
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
