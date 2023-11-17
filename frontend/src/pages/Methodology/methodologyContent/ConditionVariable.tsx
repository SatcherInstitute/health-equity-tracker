import styles from '../methodologyComponents/MethodologyPage.module.scss'
import { parseDescription } from '../methodologyComponents/GlossaryTerm'

interface Definition {
  id?: string | undefined
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
    <div className='mx-auto my-4'>
      {definitionsArray.map((item) => {
        return (
          <div id={item.id} key={item.topic}>
            <h4 className='m-0'>{item.topic}</h4>
            {item.definitions.map((def) => {
              return (
                <figure
                  key={def.key}
                  className='first:border-t-1 ml-0 self-start border-0 border-alt-dark font-sansText text-smallest text-alt-green'
                >
                  <span className={styles.ConditionKey}>
                    <strong>{def.key}</strong>
                  </span>
                  <p className='m-0 ml-1 self-start text-smallest text-alt-black'>
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
