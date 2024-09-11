import type React from 'react'
import { LaunchRounded } from '@mui/icons-material'

interface HetLaunchLinkProps {
  href: string
}

const HetLaunchLink: React.FC<HetLaunchLinkProps> = ({ href }) => {
  return (
    <a href={href} target='_blank' rel='noreferrer'>
        <LaunchRounded className='text-text' />
    </a>
  )
}

export default HetLaunchLink
