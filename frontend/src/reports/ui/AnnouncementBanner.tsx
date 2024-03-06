import LightbulbIcon from '@mui/icons-material/Lightbulb'
import HetNotice from '../../styles/HetComponents/HetNotice'
import HetLinkButton from '../../styles/HetComponents/HetLinkButton'
import HetMadLibButton from '../../styles/HetComponents/HetMadLibButton'
import { Button } from 'react-scroll'
import { IconButton } from '@mui/material'

function AnnouncementBanner() {
  return (
    <HetNotice
      className='m-2 mt-0 border border-secondaryMain text-left text-small'
      icon={<LightbulbIcon color='primary' />}
      title='Did You Know?'
      kind='text-only'
    >
      <p>
        Historical data reveals that women in government positions significantly
        contribute to higher rates of inclusivity and equitable power
        distribution, fostering a more representative democracy.
      </p>
      <IconButton
        href={'/exploredata?mls=1.women_in_gov-3.00&group1=All'}
        className='mx-0 my-2 px-0 text-left text-text'
      >
        Explore the Women in Government Data →
      </IconButton>
    </HetNotice>
  )
}

export default AnnouncementBanner
