import { Grid } from '@mui/material'
import React from 'react'
import { useLocation } from 'react-router-dom'
import { Fips } from '../../data/utils/Fips'
import {
  DEFAULT,
  MADLIB_LIST,
  getMadLibWithUpdatedValue,
  insertOptionalThe,
  type MadLib,
  type PhraseSegment,
} from '../../utils/MadLibs'
import OptionsSelector from './OptionsSelector'
import styles from './ExploreDataPage.module.scss'
import {
  MADLIB_PHRASE_PARAM,
  MADLIB_SELECTIONS_PARAM,
  setParameters,
  stringifyMls,
} from '../../utils/urlutils'

export default function MadLibUI(props: {
  madLib: MadLib
  setMadLibWithParam: (updatedMadLib: MadLib) => void
}) {
  // TODO - this isn't efficient, these should be stored in an ordered way
  function getOptionsFromPhraseSegement(
    phraseSegment: PhraseSegment
  ): Fips[] | string[][] {
    // check first option to tell if phraseSegment is FIPS or CONDITIONS
    return isNaN(Object.keys(phraseSegment)[0] as any)
      ? Object.entries(phraseSegment).sort((a, b) => a[0].localeCompare(b[0]))
      : Object.keys(phraseSegment)
          .sort((a: string, b: string) => {
            if (a.length === b.length) {
              return a.localeCompare(b)
            }
            return b.length > a.length ? -1 : 1
          })
          .map((fipsCode) => new Fips(fipsCode))
  }

  const location = useLocation()

  function handleOptionUpdate(newValue: string, index: number) {
    // madlib with updated topic
    props.setMadLibWithParam(
      getMadLibWithUpdatedValue(props.madLib, index, newValue)
    )

    if (newValue === DEFAULT) {
      props.setMadLibWithParam(MADLIB_LIST[0])
      setParameters([
        {
          name: MADLIB_SELECTIONS_PARAM,
          value: stringifyMls(MADLIB_LIST[0].defaultSelections),
        },
        {
          name: MADLIB_PHRASE_PARAM,
          value: MADLIB_LIST[0].id,
        },
      ])
    }
    location.hash = ''
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <Grid id="madlib-box" container justifyContent="center" alignItems="center">
      <div className={styles.MadLibUI}>
        {props.madLib.phrase.map(
          (phraseSegment: PhraseSegment, index: number) => (
            <React.Fragment key={index}>
              {typeof phraseSegment === 'string' ? (
                <span className={styles.NonClickableMadlibText}>
                  {phraseSegment}
                  {insertOptionalThe(props.madLib.activeSelections, index)}
                </span>
              ) : (
                <OptionsSelector
                  key={index}
                  value={props.madLib.activeSelections[index]}
                  onOptionUpdate={(newValue) => {
                    handleOptionUpdate(newValue, index)
                  }}
                  options={getOptionsFromPhraseSegement(phraseSegment)}
                />
              )}
            </React.Fragment>
          )
        )}
      </div>
    </Grid>
  )
}
