import { ExpandMore } from '@mui/icons-material'
import { Button } from '@mui/material'
import type React from 'react'

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
      className={`mx-2 font-medium font-sansTitle text-navlinkColor text-small ${className}`}
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
