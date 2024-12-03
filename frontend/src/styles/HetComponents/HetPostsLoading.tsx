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
    <div className='w-full grid grid-cols-12 gap-4'>
      {[...Array(numberLoadingSkeletons)].map((_, i) => {
        const isFirst = i === 0
        // const isNextFour = !isFirst && i < 5

        return (
          <div
            className={`col-span-12 ${!isFirst && 'smMd:col-span-6 lg:col-span-4'} lg:col-span-4 ${isFirst && 'lg:row-span-2'} $ w-full my-4 rounded-md border border-solid border-altGreen flex flex-wrap  ${props.className ?? ''}`}
            key={i}
          >
            {/* IMG PLACEHOLDER */}
            <Skeleton
              animation={props.doPulse && 'wave'}
              variant='rectangular'
              height={`${isFirst && isLg ? '40rem' : '10rem'}`}
              sx={{ width: '100%' }}
            ></Skeleton>
            {/* TAGS PLACEHOLDER ON LARGEST SCREENS */}
            <div className='hidden lg:flex my-3 w-full ml-4 justify-start gap-5'>
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
            {/* TITLE PLACEHOLDER */}
            <Skeleton
              className='mt-10 mx-4'
              animation={props.doPulse && 'wave'}
              variant='text'
              height={36}
              sx={{ width: '100%' }}
            ></Skeleton>
            <Skeleton
              className='ml-4 mr-20 mb-4'
              animation={props.doPulse && 'wave'}
              variant='text'
              height={36}
              sx={{ width: '100%' }}
            ></Skeleton>
          </div>
        )
      })}
    </div>
  )
}
