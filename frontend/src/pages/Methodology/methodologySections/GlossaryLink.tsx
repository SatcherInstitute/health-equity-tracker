import { Helmet } from 'react-helmet-async'
import styles from '../methodologyComponents/MethodologyPage.module.scss'
import { definitionsGlossary } from '../methodologyContent/DefinitionGlossary'
import { parseDescription } from '../methodologyComponents/DataTable'

const GlossaryLink: React.FC = () => {
  return (
    <section>
      <article>
        <Helmet>
          <title>Glossary - Health Equity Tracker</title>
        </Helmet>
        <h2 className={styles.ScreenreaderTitleHeader}>Glossary</h2>
        <div>
          {definitionsGlossary.map((item, idx) => (
            <div key={idx}>
              <h3>{item.topic}</h3>
              {item.definitions.map((definition, defIdx) => (
                <div key={defIdx}>
                  <h4>{definition.key}:</h4>
                  <p>{parseDescription(definition.description)}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </article>
    </section>
  )
}
export default GlossaryLink
