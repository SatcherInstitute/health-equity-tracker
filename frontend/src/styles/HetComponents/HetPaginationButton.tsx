import ArrowBack from '@mui/icons-material/ArrowBack'
import ArrowForward from '@mui/icons-material/ArrowForward'
import { Button } from '@mui/material'

type HetPaginationDirection = 'previous' | 'next'

interface HetPaginationButtonsProps {
  direction: HetPaginationDirection
  onClick: () => void
  children?: React.ReactNode | string
  disabled?: boolean
  className?: string
}

export default function HetPaginationButton({
  direction,
  onClick,
  children,
  disabled,
  className,
}: HetPaginationButtonsProps) {
  const isPrevious = direction === 'previous'

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={`bg-methodology-green font-sans-title text-alt-black leading-some-more-space shadow-raised-tighter hover:shadow-raised smplus:w-full my-2 flex h-24 max-h-32 min-h-24 flex-col justify-center rounded-3xl font-medium tracking-wide sm:w-auto md:w-80 lg:mb-0 ${className}`}
    >
      {/* ARROW AND DIRECTION WORD */}
      <span
        className={`font-sans-text text-alt-black text-small lg:leading-some-more-space mt-5 flex items-center self-stretch leading-loose ${
          isPrevious ? 'ml-5 justify-start' : 'mr-5 justify-end'
        }`}
      >
        {isPrevious ? (
          <span className='flex items-center'>
            <ArrowBack /> <span>Previous</span>
          </span>
        ) : (
          <span className='flex items-center'>
            <span>Up Next</span> <ArrowForward />
          </span>
        )}
      </span>
      {/* LABEL FOR LINKED PAGE */}
      <span className='text-text mb-5 flex shrink-0 flex-col justify-center gap-2 self-stretch p-2 leading-normal font-semibold'>
        <span
          className={
            isPrevious
              ? 'ml-5 items-start justify-start text-left'
              : 'mr-5 items-end justify-end text-right'
          }
          data-pagination-content='true'
        >
          {children}
        </span>
      </span>
    </Button>
  )
}
