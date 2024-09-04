import MenuItem from '@mui/material/MenuItem'
import {
  EmailShareButton,
  FacebookShareButton,
  LinkedinShareButton,
  TwitterShareButton,
  EmailIcon,
  FacebookIcon,
  LinkedinIcon,
  XIcon,
} from 'react-share'
import type { PopoverElements } from '../../utils/hooks/usePopover'
import { het } from '../../styles/DesignTokens'

const shareIconAttributes = {
  iconFillColor: het.hexShareIconGray,
  bgStyle: { fill: 'none' },
  size: 39,
}

interface CardShareIconsProps {
  popover: PopoverElements
  reportTitle: string
  urlWithHash: string
}

export default function CardShareIcons(props: CardShareIconsProps) {
  const title = `Health Equity Tracker - ${props.reportTitle}`
  const emailShareBody = `${title}${'\n'}${'\n'}` // Add line breaks here if needed
  const sharedUrl = props.urlWithHash

  function handleClose() {
    props.popover.close()
  }

  return (
    <>
      <MenuItem
        aria-label={'Share to X (formerly Twitter)'}
        onClick={handleClose}
      >
        <TwitterShareButton
          hashtags={['healthequity']}
          related={['@SatcherHealth', '@MSMEDU']}
          url={sharedUrl}
          className='flex items-center px-2 py-1'
        >
          <XIcon {...shareIconAttributes} className='mx-0 w-8' />
          <div>Share on X (Twitter)</div>
        </TwitterShareButton>
      </MenuItem>

      <MenuItem aria-label={'Share on Facebook'} onClick={handleClose}>
        <FacebookShareButton
          aria-label={'Post this report to Facebook'}
          hashtag={'#healthequity'}
          url={sharedUrl}
          className='flex items-center px-2 py-1'
        >
          <FacebookIcon {...shareIconAttributes} className='mx-0 w-8' />
          <div>Share on Facebook</div>
        </FacebookShareButton>
      </MenuItem>

      <MenuItem aria-label={'Share on LinkedIn'} onClick={handleClose}>
        <LinkedinShareButton
          aria-label={'Share to LinkedIn'}
          className='flex items-center px-2 py-1'
          source={'Health Equity Tracker'}
          url={sharedUrl}
        >
          <LinkedinIcon {...shareIconAttributes} className='mx-0 w-8' />
          <div>Share on LinkedIn</div>
        </LinkedinShareButton>
      </MenuItem>

      <MenuItem aria-label={'Email card link'} onClick={handleClose}>
        <EmailShareButton
          aria-label={'Share by email'}
          body={emailShareBody}
          className='flex items-center px-2 py-1'
          subject={`Sharing from healthequitytracker.org`}
          url={sharedUrl}
        >
          <EmailIcon {...shareIconAttributes} className='mx-0 w-8' />
          <div>Email card link</div>
        </EmailShareButton>
      </MenuItem>
    </>
  )
}
