import { Skeleton } from '@mui/material'
import { useIsBreakpointAndUp } from '../../utils/hooks/useIsBreakpointAndUp'

const NUM_OF_LOADING_SKELETONS = 12

interface HetPostsLoadingProps {
  doPulse: boolean
  numberLoading?: number
  className?: string
}
/*
displays several loading indicator elements while blog content is fetched
*/

export default function HetPostsLoading(props: HetPostsLoadingProps) {
  const numberLoadingSkeletons = props.numberLoading ?? NUM_OF_LOADING_SKELETONS

  const isLg = useIsBreakpointAndUp('lg')

  return (
    <div className='grid w-full grid-cols-12 gap-4'>
      {[...Array(numberLoadingSkeletons)].map((_, i) => {
        const isFirst = i === 0
        // const isNextFour = !isFirst && i < 5

        return (
          <div
            className={`col-span-12 ${!isFirst && 'smMd:col-span-6 lg:col-span-4'} lg:col-span-4 ${isFirst && 'lg:row-span-2'} $ my-4 flex w-full flex-wrap rounded-md border border-altGreen border-solid ${props.className ?? ''}`}
            key={i}
          >
            {/* IMG PLACEHOLDER */}
            <Skeleton
              animation={props.doPulse && 'wave'}
              variant='rectangular'
              height={`${isFirst && isLg ? '40rem' : '10rem'}`}
              sx={{ width: '100%' }}
            ></Skeleton>

            {/* TITLE PLACEHOLDER */}
            <Skeleton
              className='mx-4 mt-10'
              animation={props.doPulse && 'wave'}
              variant='text'
              height={36}
              sx={{ width: '100%' }}
            ></Skeleton>
            <Skeleton
              className='mr-20 mb-4 ml-4'
              animation={props.doPulse && 'wave'}
              variant='text'
              height={36}
              sx={{ width: '100%' }}
            ></Skeleton>
            {/* TAGS PLACEHOLDER ON LARGEST SCREENS */}
            <div className='my-3 ml-4 hidden w-full justify-start gap-5 lg:flex'>
              <Skeleton
                animation={false}
                variant='text'
                height={24}
                width={60}
              ></Skeleton>
              <Skeleton
                animation={false}
                variant='text'
                height={24}
                width={80}
              ></Skeleton>
            </div>
          </div>
        )
      })}
    </div>
  )
}
