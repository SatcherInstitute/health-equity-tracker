import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Grid,
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import styles from '../methodologyComponents/MethodologyPage.module.scss'
import { Link, useRouteMatch } from 'react-router-dom'

const useStyles = makeStyles({
  stickyHeader: {
    backgroundColor: '#fafafa', // Default background color for Material-UI TableHead
    position: 'sticky',
    top: 0,
    zIndex: 1000, // Ensure the header is above other items
  },
})

interface DataTableProps {
  headers: {
    topic: string
    definition: string
  }
  methodologyTableDefinitions: Array<{
    topic: string
    definitions: Array<{
      key: string
      description: string
    }>
    path?: string
  }>
}

const DataTable: React.FC<DataTableProps> = ({
  headers,
  methodologyTableDefinitions,
}) => {
  const classes = useStyles()

  const parseDescription = (description: string) => {
    const elements = []
    let remainingText = description

    while (remainingText.length > 0) {
      const codeStart = remainingText.indexOf('<code>')
      const linkStart = remainingText.indexOf('[')

      if (codeStart === -1 && linkStart === -1) {
        elements.push(remainingText)
        break
      }

      if (linkStart !== -1 && (codeStart === -1 || linkStart < codeStart)) {
        // Handle link
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
            target="_blank"
            rel="noopener noreferrer"
          >
            {linkText}
          </a>
        )

        remainingText = remainingText.substring(linkEnd + 1)
      } else if (
        codeStart !== -1 &&
        (linkStart === -1 || codeStart < linkStart)
      ) {
        // Handle code
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

  return (
    <section>
      <article>
        <Paper elevation={3}>
          <Table className={styles.DataTable}>
            <TableHead>
              <TableRow>
                <TableCell>{headers.topic}</TableCell>
                <TableCell>{headers.definition}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {methodologyTableDefinitions.map((item, index) => (
                <React.Fragment key={index}>
                  <TableRow>
                    <TableCell
                      component="th"
                      scope="row"
                      className={classes.stickyHeader}
                    >
                      {item.path ? (
                        <Link to={item.path}>{item.topic}</Link>
                      ) : (
                        item.topic
                      )}
                    </TableCell>
                    <TableCell>
                      <Grid container spacing={2}>
                        {item.definitions.map((definition, defIndex) => (
                          <Grid item xs={12} key={defIndex}>
                            <strong>{definition.key}:</strong>{' '}
                            {parseDescription(definition.description)}
                          </Grid>
                        ))}
                      </Grid>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </article>
    </section>
  )
}

export default DataTable
