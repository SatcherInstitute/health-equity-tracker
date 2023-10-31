import styles from '../methodologyComponents/MethodologyPage.module.scss'
import { parseDescription } from '../methodologyComponents/DataTable'

interface Definition {
  id: string | undefined
  topic: string
  definitions: Array<{
    key: string
    description: string
  }>
}

interface ConditionVariableProps {
  definitionsArray: Definition[]
}

const ConditionVariable: React.FC<ConditionVariableProps> = ({
  definitionsArray,
}) => {
  return (
    <div className={styles.GlossaryTermContainer}>
      {definitionsArray.map((item) => {
        return (
          <div id={item.id} key={item.topic}>
            <h4>{item.topic}</h4>
            {item.definitions.map((def) => {
              return (
                <figure key={def.key} className={styles.GridContainer}>
                  <span className={styles.ConditionKey}>
                    <strong>{def.key}</strong>
                  </span>
                  <p className={styles.ConditionDefinition}>
                    {parseDescription(def.description)}
                  </p>
                </figure>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

export default ConditionVariable
