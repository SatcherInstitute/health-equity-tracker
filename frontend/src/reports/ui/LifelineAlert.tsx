import PhoneIcon from '@mui/icons-material/Phone'
import { urlMap } from '../../utils/externalUrls'
import HetAlert from '../../styles/HetComponents/HetAlert'

function LifelineAlert() {
  return (
    <div>
      <HetAlert
        className='m-2 mt-0 border border-secondary-main text-left text-small'
        icon={<PhoneIcon />}
        title='988 Suicide & Crisis Lifeline'
      >
        <p>
          For 24/7, free and confidential support, prevention and crisis
          resources, and professional best practices, call{' '}
          <a href='tel:988'>9-8-8</a> or visit{' '}
          <a href={urlMap.lifeline}>988lifeline.org</a>. If you or a loved one
          is experiencing an emergency, call 911 or go to your nearest emergency
          room.
        </p>
      </HetAlert>
    </div>
  )
}

export default LifelineAlert
