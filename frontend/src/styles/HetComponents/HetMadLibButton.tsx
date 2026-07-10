import ArrowDropDown from '@mui/icons-material/ArrowDropDown'
import { Button, type ButtonProps } from '@mui/material'
import type { ReactNode } from 'react'

interface HetMadLibButtonProps extends Omit<ButtonProps, 'onClick'> {
  children: ReactNode
  handleClick: ButtonProps['onClick']
  isOpen: boolean
}

export default function HetMadLibButton({
  children,
  handleClick,
  isOpen,
  className = '',
  ...rest
}: HetMadLibButtonProps) {
  return (
    <Button
      variant='text'
      aria-haspopup='menu'
      className={`mx-4 my-1 min-w-20 rounded border border-alt-green border-solid py-0 pr-1 pl-3 font-medium text-alt-green text-fluid-mad-lib shadow-raised-tighter ${className}`}
      onClick={handleClick}
      {...rest}
    >
      <span>
        {children}
        <span className='mx-1'>
          <ArrowDropDown
            className={`mb-1 transition-transform duration-300 ease-in-out ${isOpen ? 'rotate-180' : ''}`}
          />
        </span>
      </span>
    </Button>
  )
}
