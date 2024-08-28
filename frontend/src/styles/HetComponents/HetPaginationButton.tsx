import { ArrowBack, ArrowForward } from '@mui/icons-material'
import { Button } from '@mui/material'

export type HetPaginationDirection = 'previous' | 'next'

interface HetPaginationButtonsProps {
  direction: HetPaginationDirection
  onClick: () => void
  children?: React.ReactNode | string
  disabled?: boolean
}

export default function HetPaginationButton(props: HetPaginationButtonsProps) {
  const isPrevious = props.direction === 'previous'
  return (
    <Button
      onClick={props.onClick}
      className='my-2 lg:mb-0 flex md:w-full sm:w-auto flex-col justify-center rounded-3xl bg-methodologyGreen font-sansTitle  font-medium leading-lhSomeMoreSpace tracking-wide text-altBlack shadow-raised-tighter hover:shadow-raised lg:w-80 min-h-24 max-h-32 h-24'
    >
      {/* ARROW AND DIRECTION WORD */}
      <span
        className={`mt-5 flex items-center self-stretch font-sansText text-small leading-lhLoose text-altBlack lg:leading-lhSomeMoreSpace ${
          isPrevious ? 'ml-5 justify-start' : 'mr-5 justify-end'
        }`}
      >
        {isPrevious ? (
          <span className='flex align-center'>
            <ArrowBack /> <span >Previous</span>
          </span>
        ) : (
          <span className='flex align-center'>
            <span>Up Next</span> <ArrowForward />
          </span>
        )}
      </span>
      {/* LABEL FOR LINKED PAGE */}
      <span className='mb-5 flex shrink-0 flex-col justify-center gap-2 self-stretch p-2 md:text-exploreButton text-text font-semibold'>
        <span
          className={
            isPrevious
              ? 'ml-5 items-start justify-start text-left'
              : 'mr-5 items-end justify-end text-right'
          }
        >
          {props.children}
        </span>
      </span>
    </Button>
  )
}
