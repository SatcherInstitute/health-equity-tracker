import { Alert, AlertTitle } from '@mui/material'
import styles from '../methodologyComponents/MethodologyPage.module.scss'
import { parseDescription } from '../methodologyComponents/DataTable'
import { missingDataArray } from './SourcesDefinitions'

interface DataAlert {
  id?: string | undefined
  topic: string
  definitions: Array<{
    key: string
    description: string
  }>
}

interface DataAlertErrorProps {
  alertsArray: DataAlert[]
}
const DataAlertError: React.FC<DataAlertErrorProps> = ({ alertsArray }) => {
  return (
    <div className={styles.DataAlertErrorContainer}>
      {alertsArray.map((item, id) => {
        return (
          <Alert id={item.id} key={item.topic} severity="error" role="note">
            {item.definitions.map((def) => {
              return (
                <>
                  <AlertTitle key={def.key}>{def.key}</AlertTitle>
                  <p>{parseDescription(def.description)}</p>
                </>
              )
            })}
          </Alert>
        )
      })}
    </div>
  )
}

export default DataAlertError
