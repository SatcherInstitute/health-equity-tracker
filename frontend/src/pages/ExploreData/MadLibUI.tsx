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
  DATA_TYPE_1_PARAM,
  // DATA_TYPE_1_PARAM,
  MADLIB_PHRASE_PARAM,
  MADLIB_SELECTIONS_PARAM,
  setParameters,
  stringifyMls,
} from '../../utils/urlutils'
import DataTypeOptionsSelector from './DataTypeOptionsSelector'
import {
  type DropdownVarId,
  isDropdownVarId,
  METRIC_CONFIG,
  type VariableConfig,
  type VariableId,
} from '../../data/config/MetricConfig'
// import { type DropdownVarId, METRIC_CONFIG } from '../../data/config/MetricConfig'
import { useAtom } from 'jotai'
import { selectedVariableConfig1Atom } from '../../utils/sharedSettingsState'

import { atomWithLocation } from 'jotai-location'
const locationAtom = atomWithLocation()

export default function MadLibUI(props: {
  madLib: MadLib
  setMadLibWithParam: (updatedMadLib: MadLib) => void
}) {
  // TODO: this isn't efficient, these should be stored in an ordered way
  function getOptionsFromPhraseSegment(
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
    // drop card hash from url and scroll to top
    location.hash = ''
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  const [selectedVariableConfig1, setSelectedVariableConfig1] = useAtom(
    selectedVariableConfig1Atom
  )
  const [, setLocation] = useAtom(locationAtom)

  return (
    <Grid
      item
      xs={12}
      id="madlib-box"
      container
      justifyContent="center"
      alignItems="center"
    >
      <div className={styles.MadLibUI}>
        {props.madLib.phrase.map(
          (phraseSegment: PhraseSegment, index: number) => {
            let dataTypes: any[][] = []

            const segmentVariableId: DropdownVarId | string =
              props.madLib.activeSelections[index]
            if (isDropdownVarId(segmentVariableId)) {
              dataTypes = METRIC_CONFIG[segmentVariableId].map(
                (variableConfig: VariableConfig) => {
                  const { variableId, dataTypeName } = variableConfig
                  return [variableId, dataTypeName]
                }
              )
            }

            return (
              <React.Fragment key={index}>
                {typeof phraseSegment === 'string' ? (
                  <span className={styles.NonClickableMadlibText}>
                    {phraseSegment}
                    {insertOptionalThe(props.madLib.activeSelections, index)}
                  </span>
                ) : (
                  <>
                    <OptionsSelector
                      key={index}
                      value={props.madLib.activeSelections[index]}
                      onOptionUpdate={(newValue) => {
                        handleOptionUpdate(newValue, index)
                      }}
                      options={getOptionsFromPhraseSegment(phraseSegment)}
                    />

                    {dataTypes.length > 1 && (
                      <DataTypeOptionsSelector
                        key={`${index}-datatype`}
                        value={
                          selectedVariableConfig1?.variableId ?? dataTypes[0][0]
                        }
                        onOptionUpdate={(newValue) => {
                          const newConfig = getConfigFromVariableId(
                            newValue as VariableId
                          )
                          newConfig && setSelectedVariableConfig1(newConfig)
                          const params = new URLSearchParams(location.search)
                          params.set(DATA_TYPE_1_PARAM, newValue)
                          setLocation((prev) => ({
                            ...prev,
                            searchParams: params,
                          }))
                        }}
                        options={dataTypes}
                      />
                    )}
                  </>
                )}
              </React.Fragment>
            )
          }
        )}
      </div>
      {/* <Grid item xs={12}>
        <small>{def}</small>

      </Grid> */}
    </Grid>
  )
}

function getConfigFromVariableId(id: VariableId): VariableConfig | undefined {
  return Object.values(METRIC_CONFIG)
    .flat()
    .find((config) => config.variableId === id)
}
