import Skeleton from '@mui/material/Skeleton'

interface HetPostsLoadingProps {
  doPulse: boolean
  index?: number
}

export default function HetPostsLoading({ doPulse }: HetPostsLoadingProps) {
  return (
    <div className='flex w-full flex-col overflow-hidden rounded-md border border-alt-green border-solid'>
      <Skeleton
        animation={doPulse ? 'wave' : false}
        variant='rectangular'
        height='14rem'
        sx={{ width: '100%' }}
      />
      <div className='flex flex-col gap-2 p-4'>
        <Skeleton
          animation={doPulse ? 'wave' : false}
          variant='text'
          height={28}
          sx={{ width: '80%' }}
        />
        <Skeleton
          animation={doPulse ? 'wave' : false}
          variant='text'
          height={28}
          sx={{ width: '50%' }}
        />
      </div>
    </div>
  )
}
