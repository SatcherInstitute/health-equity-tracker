import { Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'

interface HetButtonSecondaryProps {
  text: string
  href?: string
  ariaLabel?: string
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
  className?: string
}

export default function HetButtonSecondary({
  text,
  href,
  ariaLabel,
  className,
  onClick,
}: HetButtonSecondaryProps) {
  const navigate = useNavigate()

  const handleClick = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    if (onClick) {
      onClick(event)
    }
    if (href) {
      navigate(href)
    }
  }

  return (
    <Button
      variant='outlined'
      className={`shadow-none hover:shadow-none hover:border-methodologyGreen rounded-2xl my-2 mx-auto px-8 py-2 w-auto bg-white hover:bg-methodologyGreen ${className ?? ''}`}
      onClick={handleClick}
      aria-label={ariaLabel}
    >
      <span className='text-small text-altGreen hover:text-altBlack font-bold shadow-none hover:shadow-none'>
        {text}
      </span>
    </Button>
  )
}
