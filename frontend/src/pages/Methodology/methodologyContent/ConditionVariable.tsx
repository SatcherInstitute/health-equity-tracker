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

export default function ConditionVariable({
  definitionsArray,
}: ConditionVariableProps) {
  return (
    <div className='mx-auto my-4'>
      {definitionsArray.map((item) => {
        return (
          <div id={item.id} key={item.topic}>
            <h3 className='mt-12 text-title font-medium'>{item.topic}</h3>
            {item.definitions.map((def) => {
              return (
                <figure
                  key={def.key}
                  className='ml-0 self-start border-0 border-altDark font-sansText text-smallest text-altGreen first:border-t'
                >
                  <span>
                    <strong>{def.key}</strong>
                  </span>
                  <p className='m-0 ml-1 self-start text-smallest text-altBlack'>
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
