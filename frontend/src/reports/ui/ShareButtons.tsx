import { Tooltip } from '@mui/material'
import { colors } from '../../styles/tokens/colors'
import {
  EmailIcon,
  emailShareUrl,
  FacebookIcon,
  facebookShareUrl,
  LinkedinIcon,
  linkedinShareUrl,
  openShareWindow,
} from '../../utils/socialShare'

export const SHARE_LABEL = 'Share this report:'

interface ShareButtonProps {
  isMobile: boolean
  reportTitle?: string
}

export default function ShareButtons(props: ShareButtonProps) {
  const sharedUrl: string = window.location.href
  let title: string = 'Health Equity Tracker'
  if (props.reportTitle) {
    title += ': ' + props.reportTitle
  }

  const iconSize = props.isMobile ? 64 : 32
  const iconFillColor = colors.altDark

  const fbHref = facebookShareUrl(sharedUrl)
  const liHref = linkedinShareUrl(sharedUrl)
  const emailHref = emailShareUrl(
    sharedUrl,
    'Sharing from healthequitytracker.org',
    `${title}\n\n`,
  )

  return (
    <div
      className={`flex ${
        props.reportTitle ? 'justify-center' : 'justify-start'
      }`}
    >
      <div>
        <Tooltip title='Post this page to Facebook'>
          <a
            href={fbHref}
            target='_blank'
            rel='noopener noreferrer'
            aria-label='Post this page to Facebook'
            onClick={(e) => {
              e.preventDefault()
              openShareWindow(fbHref)
            }}
          >
            <FacebookIcon size={iconSize} iconFillColor={iconFillColor} />
          </a>
        </Tooltip>

        <Tooltip title='Post this page to LinkedIn'>
          <a
            href={liHref}
            target='_blank'
            rel='noopener noreferrer'
            aria-label='Share to LinkedIn'
            onClick={(e) => {
              e.preventDefault()
              openShareWindow(liHref)
            }}
          >
            <LinkedinIcon size={iconSize} iconFillColor={iconFillColor} />
          </a>
        </Tooltip>

        <Tooltip title='Share this page by email'>
          <a href={emailHref} aria-label='Share by email'>
            <EmailIcon size={iconSize} iconFillColor={iconFillColor} />
          </a>
        </Tooltip>
      </div>
    </div>
  )
}
