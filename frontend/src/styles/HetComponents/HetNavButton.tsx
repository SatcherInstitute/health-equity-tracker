import type React from 'react'
import { Button } from '@mui/material'
import { ExpandMore } from '@mui/icons-material'

interface HetNavButtonProps {
  label: string
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void
  className?: string
  isExpanded?: boolean
}

const HetNavButton: React.FC<HetNavButtonProps> = ({
  label,
  onClick,
  className = '',
  isExpanded = false,
}) => {
  return (
    <Button
      className={`font-sansTitle text-small font-medium text-navlinkColor mx-2 ${className}`}
      onClick={onClick}
      endIcon={<ExpandMore />}
      aria-haspopup='true'
      aria-expanded={isExpanded}
    >
      {label}
    </Button>
  )
}

export default HetNavButton
