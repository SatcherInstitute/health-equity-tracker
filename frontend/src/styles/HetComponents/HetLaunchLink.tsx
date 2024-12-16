import type React from 'react'
import { LaunchRounded } from '@mui/icons-material'

interface HetLaunchLinkProps {
  href: string
  label?: string
}

const HetLaunchLink: React.FC<HetLaunchLinkProps> = ({ href, label }) => {
  return (
    <a
      href={href}
      target='_blank'
      rel='noreferrer'
      aria-label={
        label
          ? `Opens the ${label} website in a new window`
          : `Opens ${href} in a new window`
      }
    >
      <LaunchRounded className='text-text' />
    </a>
  )
}

export default HetLaunchLink
