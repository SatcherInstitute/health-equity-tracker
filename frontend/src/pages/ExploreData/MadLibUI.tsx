import { useAtom } from 'jotai'
import React from 'react'
import {
  type DropdownVarId,
  isDropdownVarId,
} from '../../data/config/DropDownIds'
import { METRIC_CONFIG } from '../../data/config/MetricConfig'
import type {
  DataTypeConfig,
  DataTypeId,
} from '../../data/config/MetricConfigTypes'
import type { DemographicType } from '../../data/query/Breakdowns'
import { isFipsString } from '../../data/utils/Fips'
import { getAllDemographicOptions } from '../../reports/reportUtils'
import {
  DEFAULT,
  MADLIB_LIST,
  type MadLib,
  type PhraseSegment,
  getConfigFromDataTypeId,
  getFipsListFromMadlib,
  getMadLibWithUpdatedValue,
  getParentDropdownFromDataTypeId,
  insertOptionalThe,
} from '../../utils/MadLibs'
import {
  selectedDataTypeConfig1Atom,
  selectedDataTypeConfig2Atom,
} from '../../utils/sharedSettingsState'
import {
  DATA_TYPE_1_PARAM,
  DATA_TYPE_2_PARAM,
  MADLIB_PHRASE_PARAM,
  MADLIB_SELECTIONS_PARAM,
  setParameters,
  stringifyMls,
} from '../../utils/urlutils'
import DataTypeSelector from './DataTypeSelector'
import DemographicSelector from './DemographicSelector'
import LocationSelector from './LocationSelector'
import TopicSelector from './TopicSelector'

interface MadLibUIProps {
  madLib: MadLib
  setMadLibWithParam: (updatedMadLib: MadLib) => void
}

export default function MadLibUI(props: MadLibUIProps) {
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
        getMadLibWithUpdatedValue(props.madLib, index, newValue),
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
    newDataType: DataTypeId,
    index: number,
    setConfig: any,
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
    const dropdownId: DropdownVarId =
      getParentDropdownFromDataTypeId(newDataType)
    // madlib with updated topic
    props.setMadLibWithParam(
      getMadLibWithUpdatedValue(props.madLib, index, dropdownId),
    )
  }

  const [selectedDataTypeConfig1, setSelectedDataTypeConfig1] = useAtom(
    selectedDataTypeConfig1Atom,
  )
  const [selectedDataTypeConfig2, setSelectedDataTypeConfig2] = useAtom(
    selectedDataTypeConfig2Atom,
  )

  const fipsList = getFipsListFromMadlib(props.madLib)

  const { enabledDemographicOptionsMap, disabledDemographicOptions } =
    getAllDemographicOptions(
      selectedDataTypeConfig1,
      fipsList[0],
      selectedDataTypeConfig2,
      fipsList?.[1],
    )

  const demographicOptions: Array<[DemographicType, string]> = Object.entries(
    enabledDemographicOptionsMap,
  ).map(([label, demoType]) => [demoType as DemographicType, label])

  return (
    <>
      <div className='grid place-content-center'>
        <h1
          className='mx-0 my-2 p-0 text-center font-normal text-fluidMadLib leading-lhLoose transition-all duration-200 ease-in-out'
          id='madlib-box'
        >
          {props.madLib.phrase.map(
            (phraseSegment: PhraseSegment, index: number) => {
              let dataTypes: Array<[DataTypeId, string]> = []

              const segmentDataTypeId: DropdownVarId | string =
                props.madLib.activeSelections[index]
              if (isDropdownVarId(segmentDataTypeId)) {
                dataTypes = METRIC_CONFIG[segmentDataTypeId]?.map(
                  (dataTypeConfig: DataTypeConfig) => {
                    const { dataTypeId, dataTypeShortLabel } = dataTypeConfig
                    return [dataTypeId, dataTypeShortLabel]
                  },
                )
              }

              const config =
                index === 1 ? selectedDataTypeConfig1 : selectedDataTypeConfig2
              const setConfig =
                index === 1
                  ? setSelectedDataTypeConfig1
                  : setSelectedDataTypeConfig2

              const isLocationMadLib = isFipsString(
                props.madLib.activeSelections[index],
              )

              return (
                <React.Fragment
                  key={
                    typeof phraseSegment === 'string'
                      ? phraseSegment
                      : `phrase-${index}`
                  }
                >
                  {typeof phraseSegment === 'string' ? (
                    // NON_INTERACTIVE MADLIB WORDS
                    (<span className='text-altBlack'>
                      {phraseSegment}
                      {insertOptionalThe(props.madLib.activeSelections, index)}
                    </span>)
                  ) : (
                    <>
                      {isLocationMadLib ? (
                        // LOCATION
                        (<LocationSelector
                          newValue={props.madLib.activeSelections[index]}
                          onOptionUpdate={(newValue) => {
                            handleOptionUpdate(newValue, index)
                          }}
                          phraseSegment={phraseSegment}
                        />)
                      ) : (
                        // MAIN PARENT TOPIC
                        (<TopicSelector
                          newValue={
                            props.madLib.activeSelections[
                              index
                            ] as DropdownVarId
                          }
                          onOptionUpdate={(newValue) => {
                            handleOptionUpdate(newValue, index)
                          }}
                          phraseSegment={phraseSegment}
                        />)
                      )}

                      {dataTypes?.length > 1 && (
                        // DATA TYPE SUB TOPIC
                        (<DataTypeSelector
                          key={`${index}-datatype`}
                          newValue={config?.dataTypeId ?? dataTypes[0][0]}
                          onOptionUpdate={(newValue) => {
                            handleDataTypeUpdate(
                              newValue as DataTypeId,
                              index,
                              setConfig,
                            )
                          }}
                          options={dataTypes}
                        />)
                      )}
                    </>
                  )}
                </React.Fragment>
              );
            },
          )}
          <span>by</span>
          <DemographicSelector options={demographicOptions} />
        </h1>
      </div>
    </>
  );
}
