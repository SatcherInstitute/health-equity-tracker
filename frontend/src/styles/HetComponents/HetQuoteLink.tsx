import type React from 'react'
import { FormatQuote } from '@mui/icons-material'

interface HetQuoteLinkProps {
  href: string
}

const HetQuoteLink: React.FC<HetQuoteLinkProps> = ({ href }) => {
  return (
    <a href={href}>
      <span>
        [<FormatQuote className='text-text' />]
      </span>
    </a>
  )
}

export default HetQuoteLink
