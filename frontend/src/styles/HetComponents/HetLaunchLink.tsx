import { LaunchRounded } from '@mui/icons-material'
import type React from 'react'

interface HetLaunchLinkProps {
  href: string
  label?: string
  svgClassName?: string
}

const HetLaunchLink: React.FC<HetLaunchLinkProps> = ({
  href,
  label,
  svgClassName,
}) => {
  return (
    <a
      href={href}
      target='_blank'
      rel='noreferrer noopener'
      aria-label={
        label
          ? `Opens the ${label} website in a new window`
          : `Opens ${href} in a new window`
      }
    >
      <LaunchRounded className={svgClassName || 'my-auto text-text'} />
    </a>
  )
}

export default HetLaunchLink
