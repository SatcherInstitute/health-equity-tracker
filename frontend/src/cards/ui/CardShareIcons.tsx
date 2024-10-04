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
import { useCardImage } from '../../utils/hooks/useCardImage'
import type { ScrollableHashId } from '../../utils/hooks/useStepObserver'
import type { ComponentType } from 'react'
import { HetCardExportMenuItem } from '../../styles/HetComponents/HetCardExportMenuItem'

const shareIconAttributes = {
  iconFillColor: het.hexShareIconGray,
  bgStyle: { fill: 'none' },
  size: 39,
}

interface CardShareIconsProps {
  popover: PopoverElements
  reportTitle: string
  scrollToHash: ScrollableHashId
}

interface ShareButtonConfig {
  Button: ComponentType<any>
  Icon: ComponentType<any>
  label: string
  props: Record<string, any>
}

export default function CardShareIcons(props: CardShareIconsProps) {
  const title = `Health Equity Tracker - ${props.reportTitle}`
  const emailShareBody = `${title}${'\n'}${'\n'}`

  const { cardUrlWithHash, handleClose } = useCardImage(
    props.popover,
    props.scrollToHash,
  )

  const shareButtons: ShareButtonConfig[] = [
    {
      Button: TwitterShareButton,
      Icon: XIcon,
      label: 'Share on X',
      props: {
        hashtags: ['healthequity'],
        related: ['@SatcherHealth', '@MSMEDU'],
        'aria-label': 'Share to X (formerly Twitter)',
      },
    },
    {
      Button: FacebookShareButton,
      Icon: FacebookIcon,
      label: 'Share on Facebook',
      props: {
        hashtag: '#healthequity',
        'aria-label': 'Post this report to Facebook',
      },
    },
    {
      Button: LinkedinShareButton,
      Icon: LinkedinIcon,
      label: 'Share on LinkedIn',
      props: {
        source: 'Health Equity Tracker',
        'aria-label': 'Share to LinkedIn',
      },
    },
    {
      Button: EmailShareButton,
      Icon: EmailIcon,
      label: 'Email card link',
      props: {
        body: emailShareBody,
        subject: 'Sharing from healthequitytracker.org',
        'aria-label': 'Share by email',
      },
    },
  ]

  return (
    <>
      {shareButtons.map(({ Button, Icon, label, props: buttonProps }) => (
        <HetCardExportMenuItem
          key={label}
          Icon={Icon}
          onClick={handleClose}
          className='p-0'
          iconProps={shareIconAttributes}
        >
          <Button
            url={cardUrlWithHash}
            className='flex w-full items-center px-2 py-1'
            {...buttonProps}
          >
            {label}
          </Button>
        </HetCardExportMenuItem>
      ))}
    </>
  )
}
