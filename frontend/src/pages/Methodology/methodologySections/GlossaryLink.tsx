import { Helmet } from 'react-helmet-async'
import styles from '../methodologyComponents/MethodologyPage.module.scss'
import { definitionsGlossary } from '../methodologyContent/DefinitionGlossary'
import {
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Grid,
} from '@mui/material'
import { Link } from 'react-router-dom'

const GlossaryLink: React.FC = () => {
  return (
    <section>
      <article>
        <Helmet>
          <title>Glossary - Health Equity Tracker</title>
        </Helmet>
        <h2 className={styles.ScreenreaderTitleHeader}>Glossary</h2>

        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                {/* <TableCell> */}
                Lorem, ipsum dolor sit amet consectetur adipisicing elit.
                Consequatur quaerat totam soluta eos ullam minima voluptates
                tempore, aperiam ex fugit maiores numquam culpa error officia
                magnam veniam voluptatibus maxime! Veritatis.
                {/* </TableCell> */}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>
                  <Link to={''}>link</Link>
                </TableCell>
                <TableCell>
                  <Grid>body</Grid>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Paper>

        {/* <div>
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
        </div> */}
      </article>
    </section>
  )
}
export default GlossaryLink
