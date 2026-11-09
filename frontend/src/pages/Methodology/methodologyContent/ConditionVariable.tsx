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
            <h2 className='text-title mt-12 font-medium' id={itemVal.id}>
              {itemKey}
            </h2>
            {itemVal.definitions.map((def) => {
              return (
                <figure
                  key={def.key}
                  className='border-alt-dark font-sans-text text-alt-green text-smallest ml-0 self-start border-0 first:border-t'
                >
                  <span>
                    <strong>{def.key}</strong>
                  </span>
                  <p className='text-alt-black text-small m-0 ml-1 self-start'>
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
