// import { definitionsGlossary } from '../methodologyContent/DefinitionGlossary'
import styles from '../methodologyComponents/MethodologyPage.module.scss'
import { parseDescription } from '../methodologyComponents/DataTable'

interface GlossaryDefinition {
  key: string
  description: string
}

interface GlossaryTermItem {
  topic: string
  definitions: GlossaryDefinition[]
}

interface GlossaryTermProps {
  topic: string
  definitionItems: GlossaryTermItem[]
  id?: string
}

const GlossaryTerm: React.FC<GlossaryTermProps> = ({
  definitionItems,
  topic,
}) => {
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
          <div key={index} className={styles.GlossaryTermContainer}>
            <h4 className={styles.GlossaryTerm}>{item.topic}</h4>
            <p className={styles.GlossaryDefinition}>{parsedDefinition}</p>
          </div>
        )
      })}
    </>
  )
}

export default GlossaryTerm
