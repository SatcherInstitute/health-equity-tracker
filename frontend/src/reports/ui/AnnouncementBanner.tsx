import LightbulbIcon from '@mui/icons-material/Lightbulb'
import HetNotice from '../../styles/HetComponents/HetNotice'
import { IconButton } from '@mui/material'
import { urlMap } from '../../utils/externalUrls'

export default function AnnouncementBanner() {
  return (
    <HetNotice
      className='my-8 mx-8 border border-secondaryMain text-left text-small'
      icon={<LightbulbIcon color='primary' />}
      title='Did You Know?'
      kind='text-only'
    >
      <p className='w-full'>
        <a href={urlMap.whoWomenVoting} target='_blank' rel='noreferrer'>
          Historical data
        </a>{' '}
        reveals that women in government positions significantly contribute to
        higher rates of inclusivity and equitable power distribution, fostering
        a more representative democracy.
      </p>

      <IconButton
        href={'/exploredata?mls=1.women_in_gov-3.00&group1=All'}
        className='mx-0 my-2 px-0 text-left text-text rounded-xs'
      >
        Explore the Women in Government Data →
      </IconButton>
    </HetNotice>
  )
}
