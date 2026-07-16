import type { ComponentType } from 'react'
import { HetCardExportMenuItem } from '../../styles/HetComponents/HetCardExportMenuItem'
import { colors } from '../../styles/tokens/colors'
import { useCardImage } from '../../utils/hooks/useCardImage'
import type { PopoverElements } from '../../utils/hooks/usePopover'
import type { ScrollableHashId } from '../../utils/hooks/useStepObserver'
import {
  EmailIcon,
  emailShareUrl,
  FacebookIcon,
  facebookShareUrl,
  LinkedinIcon,
  linkedinShareUrl,
  openShareWindow,
  type ShareIconProps,
} from '../../utils/socialShare'

const shareIconAttributes = {
  iconFillColor: colors.hexShareIconGray,
}

interface CardShareIconButtonsProps {
  popover: PopoverElements
  reportTitle: string
  scrollToHash: ScrollableHashId
}

interface ShareConfig {
  Icon: ComponentType<ShareIconProps>
  label: string
  href: string
  ariaLabel: string
  openInWindow: boolean
}

export default function CardShareIconButtons(props: CardShareIconButtonsProps) {
  const title = `Health Equity Tracker - ${props.reportTitle}`
  const emailBody = `${title}\n\n`

  const { cardUrlWithHash, handleClose } = useCardImage(
    props.popover,
    props.scrollToHash,
  )

  const shareConfigs: ShareConfig[] = [
    {
      Icon: FacebookIcon,
      label: 'Share on Facebook',
      href: facebookShareUrl(cardUrlWithHash),
      ariaLabel: 'Post this report to Facebook',
      openInWindow: true,
    },
    {
      Icon: LinkedinIcon,
      label: 'Share on LinkedIn',
      href: linkedinShareUrl(cardUrlWithHash),
      ariaLabel: 'Share to LinkedIn',
      openInWindow: true,
    },
    {
      Icon: EmailIcon,
      label: 'Email card link',
      href: emailShareUrl(
        cardUrlWithHash,
        'Sharing from healthequitytracker.org',
        emailBody,
      ),
      ariaLabel: 'Share by email',
      openInWindow: false,
    },
  ]

  return (
    <>
      {shareConfigs.map(({ Icon, label, href, ariaLabel, openInWindow }) => (
        <HetCardExportMenuItem
          key={label}
          Icon={Icon}
          onClick={handleClose}
          className='p-0'
          iconProps={shareIconAttributes}
        >
          <a
            href={href}
            aria-label={ariaLabel}
            target={openInWindow ? '_blank' : undefined}
            rel={openInWindow ? 'noopener noreferrer' : undefined}
            className='font-normal text-alt-black no-underline'
            onClick={
              openInWindow
                ? (e) => {
                    e.preventDefault()
                    openShareWindow(href)
                  }
                : undefined
            }
          >
            {label}
          </a>
        </HetCardExportMenuItem>
      ))}
    </>
  )
}
