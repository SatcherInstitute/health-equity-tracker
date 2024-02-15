export interface GlossaryDefinition {
  key: string
  description: string
}

export interface GlossaryTermItem {
  topic: string
  definitions: GlossaryDefinition[]
  path?: string
  id?: string
}

interface GlossaryTermProps {
  topic: string
  definitionItems: GlossaryTermItem[]
  id?: string
}

export default function GlossaryTerm(props: GlossaryTermProps) {
  const { definitionItems } = props

  const sortedDefinitionItems = [...definitionItems].sort((a, b) =>
    a.topic.localeCompare(b.topic)
  )

  return (
    <>
      {sortedDefinitionItems.map((item, index) => {
        const glossaryDefinition = item.definitions.find(
          (def) => def.key === 'Measurement Definition'
        )?.description

        return (
          <div key={index} className='mx-auto my-4'>
            <h4 className='mx-auto mb-0 mt-1 font-sansTitle text-text font-medium text-altGreen '>
              {item.topic}
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
