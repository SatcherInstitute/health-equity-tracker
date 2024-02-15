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

export const parseDescription = (description: string) => {
  const elements: any[] = []
  let remainingText = description

  while (remainingText?.length > 0) {
    const codeStart = remainingText.indexOf('<code>')
    const linkStart = remainingText.indexOf('[')

    if (codeStart === -1 && linkStart === -1) {
      elements.push(remainingText)
      break
    }

    if (linkStart !== -1 && (codeStart === -1 || linkStart < codeStart)) {
      elements.push(remainingText.substring(0, linkStart))
      remainingText = remainingText.substring(linkStart)

      const linkEnd = remainingText.indexOf(')')
      const linkTextStart = remainingText.indexOf('[') + 1
      const linkTextEnd = remainingText.indexOf(']')
      const linkUrlStart = remainingText.indexOf('(') + 1

      const linkText = remainingText.substring(linkTextStart, linkTextEnd)
      const linkUrl = remainingText.substring(linkUrlStart, linkEnd)

      elements.push(
        <a
          key={linkUrl}
          href={linkUrl}
          target='_blank'
          rel='noopener noreferrer'
        >
          {linkText}
        </a>
      )

      remainingText = remainingText.substring(linkEnd + 1)
    } else if (
      codeStart !== -1 &&
      (linkStart === -1 || codeStart < linkStart)
    ) {
      elements.push(remainingText.substring(0, codeStart))
      remainingText = remainingText.substring(codeStart + 6)

      const codeEnd = remainingText.indexOf('</code>')
      const codeContent = remainingText.substring(0, codeEnd)
      elements.push(<code key={codeContent}>{codeContent}</code>)

      remainingText = remainingText.substring(codeEnd + 7)
    }
  }

  return elements
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

        const parsedDefinition = glossaryDefinition
          ? parseDescription(glossaryDefinition)
          : null

        return (
          <div key={index} className='mx-auto my-4'>
            <h4 className='mx-auto mb-0 mt-1 font-sansTitle text-text font-medium text-altGreen '>
              {item.topic}
            </h4>
            <p className='mx-auto mb-0 mt-1 text-smallest text-altBlack'>
              {parsedDefinition}
            </p>
          </div>
        )
      })}
    </>
  )
}
