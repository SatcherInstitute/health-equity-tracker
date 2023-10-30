import { Alert, AlertTitle } from '@mui/material'
import styles from './LifelineAlert.module.scss'
import PhoneIcon from '@mui/icons-material/Phone'
import { urlMap } from '../../utils/externalUrls'

function LifelineAlert() {
  return (
    <div>
      <Alert
        severity="info"
        className={styles.ReportAlert}
        icon={<PhoneIcon />}
        role="note"
      >
        <AlertTitle>988 Suicide & Crisis Lifeline</AlertTitle>
        <p>
          The Lifeline provides 24/7, free and confidential support for people
          in distress. Call or text <a href="tel:988">9-8-8</a> or chat{' '}
          <a href={urlMap.lifeline}>988lifeline.org</a>. If you or a loved one
          is experiencing an emergency, call 911 or go to your nearest emergency
          room.
        </p>
      </Alert>
    </div>
  )
}

export default LifelineAlert
