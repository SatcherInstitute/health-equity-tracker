import type { ComponentType } from 'react'
import {
  EmailIcon,
  EmailShareButton,
  FacebookIcon,
  FacebookShareButton,
  LinkedinIcon,
  LinkedinShareButton,
  TwitterShareButton,
  XIcon,
} from 'react-share'
import { het } from '../../styles/DesignTokens'
import { HetCardExportMenuItem } from '../../styles/HetComponents/HetCardExportMenuItem'
import { useCardImage } from '../../utils/hooks/useCardImage'
import type { PopoverElements } from '../../utils/hooks/usePopover'
import type { ScrollableHashId } from '../../utils/hooks/useStepObserver'

const shareIconAttributes = {
  iconFillColor: het.hexShareIconGray,
  bgStyle: { fill: 'none' },
  size: 39,
}

interface CardShareIconButtonsProps {
  popover: PopoverElements
  reportTitle: string
  scrollToHash: ScrollableHashId
}

interface ShareButtonConfig {
  ShareButton: ComponentType<any>
  Icon: ComponentType<any>
  label: string
  options: Record<string, any>
}

export default function CardShareIconButtons(props: CardShareIconButtonsProps) {
  const title = `Health Equity Tracker - ${props.reportTitle}`
  const emailShareBody = `${title}${'\n'}${'\n'}`

  const { cardUrlWithHash, handleClose } = useCardImage(
    props.popover,
    props.scrollToHash,
  )

  const shareButtons: ShareButtonConfig[] = [
    {
      ShareButton: TwitterShareButton,
      Icon: XIcon,
      label: 'Share on X',
      options: {
        hashtags: ['healthequity'],
        related: ['@SatcherHealth', '@MSMEDU'],
        'aria-label': 'Share to X (formerly Twitter)',
      },
    },
    {
      ShareButton: FacebookShareButton,
      Icon: FacebookIcon,
      label: 'Share on Facebook',
      options: {
        hashtag: '#healthequity',
        'aria-label': 'Post this report to Facebook',
      },
    },
    {
      ShareButton: LinkedinShareButton,
      Icon: LinkedinIcon,
      label: 'Share on LinkedIn',
      options: {
        source: 'Health Equity Tracker',
        'aria-label': 'Share to LinkedIn',
      },
    },
    {
      ShareButton: EmailShareButton,
      Icon: EmailIcon,
      label: 'Email card link',
      options: {
        body: emailShareBody,
        subject: 'Sharing from healthequitytracker.org',
        'aria-label': 'Share by email',
      },
    },
  ]

  return (
    <>
      {shareButtons.map(({ ShareButton, Icon, label, options }) => (
        <HetCardExportMenuItem
          key={label}
          Icon={Icon}
          onClick={handleClose}
          className='p-0'
          iconProps={shareIconAttributes}
        >
          <ShareButton url={cardUrlWithHash} {...options}>
            {label}
          </ShareButton>
        </HetCardExportMenuItem>
      ))}
    </>
  )
}
