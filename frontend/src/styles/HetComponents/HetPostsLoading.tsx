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
            className={`flex flex-wrap place-content-center content-center items-center justify-center gap-x-20 ${
              props.className ?? ''
            }`}
            key={i}
          >
            <Skeleton
              animation={props.doPulse && 'wave'}
              variant='rectangular'
              height={100}
              width={150}
            ></Skeleton>
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
