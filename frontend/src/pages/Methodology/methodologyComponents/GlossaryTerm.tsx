export interface GlossaryDefinition {
  key: string
  description: string
}

export interface GlossaryTermItem {
  // TODO: GitHub #2916 refactor to remove 'topic' property; it's duplicate of the keys in the definitions Records<>
  topic: string
  definitions: GlossaryDefinition[]
  path?: string
  id?: string
}

interface GlossaryTermProps {
  topic: string
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
            <h4 className='mx-auto mt-1 mb-0 font-medium font-sansTitle text-altGreen text-text '>
              {itemKey}
            </h4>
            <p className='mx-auto mt-1 mb-0 text-altBlack text-smallest'>
              {glossaryDefinition}
            </p>
          </div>
        )
      })}
    </>
  )
}
