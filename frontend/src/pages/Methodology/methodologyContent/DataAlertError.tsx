import { Alert, AlertTitle } from '@mui/material'
import styles from '../methodologyComponents/MethodologyPage.module.scss'
// import { parseDescription } from '../methodologyComponents/DataTable'
import { missingDataArray } from './SourcesDefinitions'
import DefinitionTooltip from '../methodologyComponents/DefinitionTooltip'
import { definitionsGlossary } from './DefinitionGlossary'
import React from 'react'

interface DataAlert {
  id?: string | undefined
  topic: string
  definitions: Array<{
    key: string
    description: string
  }>
}

interface DataAlertErrorProps {
  alertsArray: DataAlert[]
  id?: string
}

const DataAlertError: React.FC<DataAlertErrorProps> = ({ alertsArray, id }) => {
  type TooltipMappingType = Record<string, React.ReactElement>

  const tooltipMapping: TooltipMappingType = {
    'percent share': (
      <DefinitionTooltip
        topic="Percent share"
        definitionItem={definitionsGlossary[41]}
      />
    ),
    // ... any other tooltips you have
  }
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

      // Handle tooltip terms:
      const foundTerm = Object.keys(tooltipMapping).find((term) =>
        remainingText.includes(term)
      )

      if (foundTerm) {
        const termStart = remainingText.indexOf(foundTerm)

        // Push the text before the term
        elements.push(remainingText.substring(0, termStart))

        // Push the term wrapped with its tooltip
        elements.push(
          React.cloneElement(tooltipMapping[foundTerm], { children: foundTerm })
        )

        // Update the remainingText
        remainingText = remainingText.substring(termStart + foundTerm.length)
      } else {
        // If no tooltip term is found, push the remaining text and break
        elements.push(remainingText)
        break
      }
      console.log('Found term:', foundTerm)
    }

    return elements
  }

  return (
    <div className={styles.DataAlertErrorContainer}>
      {alertsArray.map((item) => {
        return (
          <Alert id={item.id} key={item.topic} severity="error" role="note">
            {item.definitions.map((def) => {
              return (
                <>
                  <AlertTitle key={def.key}>{def.key}</AlertTitle>
                  <p>{parseDescription(def.description)}</p>
                </>
              )
            })}
          </Alert>
        )
      })}
    </div>
  )
}

export default DataAlertError
