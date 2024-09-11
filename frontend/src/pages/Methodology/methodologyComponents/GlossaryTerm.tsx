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
      {sortedDefinitionItems.map(([itemKey, itemVal], index) => {
        const glossaryDefinition = itemVal.definitions.find(
          (def) => def.key === 'Measurement Definition',
        )?.description

        return (
          <div key={index} className='mx-auto my-4'>
            <h4 className='mx-auto mb-0 mt-1 font-sansTitle text-text font-medium text-altGreen '>
              {itemKey}
            </h4>
            <p className='mx-auto mb-0 mt-1 text-smallest text-altBlack'>
              {glossaryDefinition}
            </p>
          </div>
        )
      })}
    </>
  )
}
