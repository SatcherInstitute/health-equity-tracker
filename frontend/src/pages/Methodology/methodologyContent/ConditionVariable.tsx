import type { GlossaryTermItem } from '../methodologyComponents/GlossaryTerm'

interface ConditionVariableProps {
  definitions: Record<string, GlossaryTermItem>
}

export default function ConditionVariable({
  definitions,
}: ConditionVariableProps) {
  return (
    <div className='mx-auto my-4'>
      {Object.entries(definitions).map(([itemKey, itemVal]) => {
        return (
          <div id={itemKey} key={itemKey}>
            <h3 className='mt-12 text-title font-medium'>{itemKey}</h3>
            {itemVal.definitions.map((def) => {
              return (
                <figure
                  key={def.key}
                  className='ml-0 self-start border-0 border-altDark font-sansText text-smallest text-altGreen first:border-t'
                >
                  <span>
                    <strong>{def.key}</strong>
                  </span>
                  <p className='m-0 ml-1 self-start text-small text-altBlack'>
                    {def.description}
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
