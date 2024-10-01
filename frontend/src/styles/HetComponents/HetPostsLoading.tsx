import { Skeleton } from '@mui/material'

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

  return (
    <div className='flex w-full flex-wrap justify-between '>
      {[...Array(numberLoadingSkeletons)].map((_, i) => {
        return (
          <div
            className={`flex flex-wrap  gap-x-20 ${props.className ?? ''}`}
            key={i}
          >
            {/* IMG PLACEHOLDER */}
            <Skeleton
              animation={props.doPulse && 'wave'}
              variant='rectangular'
              height={200}
              width={300}
            ></Skeleton>
            {/* TAGS PLACEHOLDER */}
            <div className='my-3 w-full flex justify-start gap-5'>
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
              animation={false}
              variant='text'
              height={36}
              width={220}
            ></Skeleton>
            <div className='mb-10'>
              <Skeleton
                animation={props.doPulse && 'wave'}
                variant='text'
                height={36}
                width={175}
              ></Skeleton>
            </div>
          </div>
        )
      })}
    </div>
  )
}
