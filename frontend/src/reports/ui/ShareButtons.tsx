import { Tooltip } from '@mui/material'
import {
  EmailIcon,
  EmailShareButton,
  FacebookIcon,
  FacebookShareButton,
  LinkedinIcon,
  LinkedinShareButton,
} from 'react-share'
import { het as colorVars } from '../../styles/theme/colorVars'

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

  const shareIconAttributes = {
    iconFillColor: colorVars.altDark,
    bgStyle: { fill: 'none' },
    size: props.isMobile ? 64 : 32,
  }

  return (
    <div
      className={`flex ${
        props.reportTitle ? 'justify-center' : 'justify-start'
      }`}
    >
      <div>
        {/* SOCIAL SHARE BUTTONS */}

        <Tooltip title='Post this page to Facebook'>
          <FacebookShareButton
            url={sharedUrl}
            hashtag={'#healthequity'}
            aria-label={'Post this page to Facebook'}
          >
            <FacebookIcon {...shareIconAttributes} />
          </FacebookShareButton>
        </Tooltip>

        <Tooltip title='Post this page to LinkedIn'>
          <LinkedinShareButton
            source={'Health Equity Tracker'}
            url={sharedUrl}
            aria-label={'Share to LinkedIn'}
          >
            <LinkedinIcon {...shareIconAttributes} />
          </LinkedinShareButton>
        </Tooltip>

        <Tooltip title='Share this page by email'>
          <EmailShareButton
            aria-label={'Share by email'}
            subject={`Sharing from healthequitytracker.org`}
            body={`${title}

`} // KEEP THIS WEIRD SPACING FOR EMAIL LINE BREAKS!
            url={sharedUrl}
          >
            <EmailIcon {...shareIconAttributes} />
          </EmailShareButton>
        </Tooltip>
      </div>
    </div>
  )
}
