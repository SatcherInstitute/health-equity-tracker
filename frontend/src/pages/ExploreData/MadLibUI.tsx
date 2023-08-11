import { Grid } from '@mui/material'
import React from 'react'
import { Fips } from '../../data/utils/Fips'
import {
  DEFAULT,
  MADLIB_LIST,
  getMadLibWithUpdatedValue,
  insertOptionalThe,
  type MadLib,
  type PhraseSegment,
} from '../../utils/MadLibs'
import TopicOrLocationSelector from './TopicOrLocationSelector'
import styles from './ExploreDataPage.module.scss'
import {
  DATA_TYPE_1_PARAM,
  DATA_TYPE_2_PARAM,
  MADLIB_PHRASE_PARAM,
  MADLIB_SELECTIONS_PARAM,
  setParameters,
  stringifyMls,
} from '../../utils/urlutils'
import DataTypeSelector from './DataTypeSelector'
import {
  type DropdownVarId,
  isDropdownVarId,
  METRIC_CONFIG,
  type DataTypeConfig,
  type DataTypeId,
} from '../../data/config/MetricConfig'
import { useAtom } from 'jotai'
import {
  selectedDataTypeConfig1Atom,
  selectedDataTypeConfig2Atom,
} from '../../utils/sharedSettingsState'

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

  function handleOptionUpdate(newValue: string, index: number) {
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
    } else {
      props.setMadLibWithParam(
        getMadLibWithUpdatedValue(props.madLib, index, newValue)
      )
    }
    // drop card hash from url and scroll to top
    window.location.hash = ''
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  function handleDataTypeUpdate(
    newDataType: string,
    index: number,
    setConfig: any
  ) {
    const dtPosition = index === 1 ? DATA_TYPE_1_PARAM : DATA_TYPE_2_PARAM
    const newConfig = getConfigFromDataTypeId(newDataType)
    newConfig && setConfig(newConfig)
    setParameters([
      {
        name: dtPosition,
        value: newDataType,
      },
    ])
    const dropdownId: DropdownVarId = getParentDropdownFromDataType(newDataType)
    // madlib with updated topic
    props.setMadLibWithParam(
      getMadLibWithUpdatedValue(props.madLib, index, dropdownId)
    )
  }

  const [selectedDataTypeConfig1, setSelectedDataTypeConfig1] = useAtom(
    selectedDataTypeConfig1Atom
  )
  const [selectedDataTypeConfig2, setSelectedDataTypeConfig2] = useAtom(
    selectedDataTypeConfig2Atom
  )

  return (
    <>
      <Grid item xs={12} container justifyContent="center" alignItems="center">
        <div className={styles.MadLibUI} id="madlib-box">
          {props.madLib.phrase.map(
            (phraseSegment: PhraseSegment, index: number) => {
              let dataTypes: any[][] = []

              const segmentDataTypeId: DropdownVarId | string =
                props.madLib.activeSelections[index]
              if (isDropdownVarId(segmentDataTypeId)) {
                dataTypes = METRIC_CONFIG[segmentDataTypeId].map(
                  (dataTypeConfig: DataTypeConfig) => {
                    const { dataTypeId, dataTypeShortLabel } = dataTypeConfig
                    return [dataTypeId, dataTypeShortLabel]
                  }
                )
              }

              const config =
                index === 1 ? selectedDataTypeConfig1 : selectedDataTypeConfig2
              const setConfig =
                index === 1
                  ? setSelectedDataTypeConfig1
                  : setSelectedDataTypeConfig2

              return (
                <React.Fragment key={index}>
                  {typeof phraseSegment === 'string' ? (
                    <span className={styles.NonClickableMadlibText}>
                      {phraseSegment}
                      {insertOptionalThe(props.madLib.activeSelections, index)}
                    </span>
                  ) : (
                    <>
                      <TopicOrLocationSelector
                        value={props.madLib.activeSelections[index]}
                        onOptionUpdate={(newValue) => {
                          handleOptionUpdate(newValue, index)
                        }}
                        options={getOptionsFromPhraseSegment(phraseSegment)}
                      />

                      {dataTypes.length > 1 && (
                        <DataTypeSelector
                          key={`${index}-datatype`}
                          value={config?.dataTypeId ?? dataTypes[0][0]}
                          onOptionUpdate={(newValue) => {
                            handleDataTypeUpdate(newValue, index, setConfig)
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
      </Grid>
    </>
  )
}

export function getConfigFromDataTypeId(
  id: DataTypeId | string
): DataTypeConfig {
  const config = Object.values(METRIC_CONFIG)
    .flat()
    .find((config) => config.dataTypeId === id)
  // fallback to covid cases
  return config ?? METRIC_CONFIG.covid[0]
}

export function getParentDropdownFromDataType(
  dataType: DataTypeId | string
): DropdownVarId {
  for (const [dropdownId, configArray] of Object.entries(METRIC_CONFIG)) {
    if (
      configArray
        .map((config) => config.dataTypeId)
        .includes(dataType as any as DataTypeId)
    ) {
      return dropdownId as any as DropdownVarId
    }
  }
  // fallback to covid
  return 'covid'
}
