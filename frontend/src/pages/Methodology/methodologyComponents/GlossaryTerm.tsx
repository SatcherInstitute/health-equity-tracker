interface GlossaryDefinition {
  key: string
  description: string
}

export interface GlossaryTermItem {
  definitions: GlossaryDefinition[]
  path?: string
  id?: string
}

interface GlossaryTermProps {
  definitionItems: Record<string, GlossaryTermItem>
  id?: string
}

export default function GlossaryTerm(props: GlossaryTermProps) {
  const { definitionItems } = props

  const sortedDefinitionItems = Object.entries(definitionItems).sort(
    ([keyA], [keyB]) => keyA.localeCompare(keyB),
  )

  return (
    <>
      {sortedDefinitionItems.map(([itemKey, itemVal]) => {
        const glossaryDefinition = itemVal.definitions.find(
          (def) => def.key === 'Measurement Definition',
        )?.description

        return (
          <div key={itemKey} className='mx-auto my-4'>
            <p className='mx-auto mt-1 mb-0 font-medium font-sans-title text-alt-green text-text'>
              {itemKey}
            </p>
            <p className='mx-auto mt-1 mb-0 text-alt-black text-smallest'>
              {glossaryDefinition}
            </p>
          </div>
        )
      })}
    </>
  )
}
