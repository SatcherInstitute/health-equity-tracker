import type React from 'react'
import { FormatQuote } from '@mui/icons-material'

interface HetQuoteLinkProps {
  href: string
  label?: string
}

const HetQuoteLink: React.FC<HetQuoteLinkProps> = ({ href, label }) => {
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
      <span>
        [<FormatQuote className='text-text' />]
      </span>
    </a>
  )
}

export default HetQuoteLink
