import { useAtomValue } from 'jotai'
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
  getFipsListFromMadlib,
  getMadLibWithUpdatedValue,
  getParentDropdownFromDataTypeId,
  insertOptionalThe,
  MADLIB_LIST,
  type MadLib,
  type PhraseSegment,
} from '../../utils/MadLibs'
import {
  selectedDataTypeConfig1Atom,
  selectedDataTypeConfig2Atom,
} from '../../utils/sharedSettingsState'
import DataTypeSelector from './DataTypeSelector'
import DemographicSelector from './DemographicSelector'
import LocationSelector from './LocationSelector'
import TopicSelector from './TopicSelector'

interface MadLibUIProps {
  madLib: MadLib
  setMadLibWithParam: (
    updatedMadLib: MadLib,
    dtOverrides?: { dt1?: string; dt2?: string },
  ) => void
}

export default function MadLibUI(props: MadLibUIProps) {
  function handleOptionUpdate(newValue: string, index: number) {
    if (newValue === DEFAULT) {
      props.setMadLibWithParam(MADLIB_LIST[0])
    } else {
      // Topic changes carry a stale dt param into the new URL. Clear it so
      // the new topic starts at its default data type.
      const isTopicChange = !isFipsString(newValue)
      const dtOverrides = isTopicChange
        ? index === 1
          ? { dt1: '' }
          : { dt2: '' }
        : undefined
      props.setMadLibWithParam(
        getMadLibWithUpdatedValue(props.madLib, index, newValue),
        dtOverrides,
      )
    }
    window.location.hash = ''
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleDataTypeUpdate(newDataType: DataTypeId, index: number) {
    const dropdownId: DropdownVarId =
      getParentDropdownFromDataTypeId(newDataType)
    const dtOverrides =
      index === 1 ? { dt1: newDataType } : { dt2: newDataType }
    props.setMadLibWithParam(
      getMadLibWithUpdatedValue(props.madLib, index, dropdownId),
      dtOverrides,
    )
  }

  const selectedDataTypeConfig1 = useAtomValue(selectedDataTypeConfig1Atom)
  const selectedDataTypeConfig2 = useAtomValue(selectedDataTypeConfig2Atom)

  const fipsList = getFipsListFromMadlib(props.madLib)

  const { enabledDemographicOptionsMap } = getAllDemographicOptions(
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
          className='mx-0 my-2 p-0 text-center font-normal text-fluid-mad-lib leading-loose transition-all duration-200 ease-in-out'
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
                    <span className='text-alt-black'>
                      {phraseSegment}
                      {insertOptionalThe(props.madLib.activeSelections, index)}
                    </span>
                  ) : (
                    <>
                      {isLocationMadLib ? (
                        <LocationSelector
                          newValue={props.madLib.activeSelections[index]}
                          onOptionUpdate={(newValue) => {
                            handleOptionUpdate(newValue, index)
                          }}
                          phraseSegment={phraseSegment}
                        />
                      ) : (
                        <TopicSelector
                          newValue={
                            props.madLib.activeSelections[
                              index
                            ] as DropdownVarId
                          }
                          onOptionUpdate={(newValue) => {
                            handleOptionUpdate(newValue, index)
                          }}
                          phraseSegment={phraseSegment}
                        />
                      )}

                      {dataTypes?.length > 1 && (
                        <DataTypeSelector
                          key={`${index}-datatype`}
                          newValue={config?.dataTypeId ?? dataTypes[0][0]}
                          onOptionUpdate={(newValue) => {
                            handleDataTypeUpdate(newValue as DataTypeId, index)
                          }}
                          options={dataTypes}
                        />
                      )}
                    </>
                  )}
                </React.Fragment>
              )
            },
          )}
          <span>by</span>
          <DemographicSelector options={demographicOptions} />
        </h1>
      </div>
    </>
  )
}
