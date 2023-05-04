import { Alert, AlertTitle, useMediaQuery, useTheme } from '@mui/material'
import styles from './DisclaimerAlert.module.scss'
import FlagIcon from '@mui/icons-material/Flag'
import { METHODOLOGY_TAB_LINK } from '../../utils/internalRoutes'
import { HashLink } from 'react-router-hash-link'

function DisclaimerAlert() {
  const theme = useTheme()
  const pageIsTiny = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <div>
      <Alert
        severity="warning"
        className={styles.ReportAlert}
        icon={!pageIsTiny ? <FlagIcon /> : <></>}
        role="note"
      >
        <AlertTitle>Major gaps in the data</AlertTitle>
        Structural racism and oppression create health inequities, and lead to
        missing data. Our reports reflect the best data we can source, but we're
        working to close these known gaps which, in turn, will help create more
        effective health policies in the United States. Read more about missing
        and misidentified people on our{' '}
        <HashLink to={`${METHODOLOGY_TAB_LINK}`}>methodology</HashLink>
      </Alert>
    </div>
  )
}

export default DisclaimerAlert
