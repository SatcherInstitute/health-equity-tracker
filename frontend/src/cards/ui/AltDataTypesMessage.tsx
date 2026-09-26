import type {
  DataTypeConfig,
  DataTypeId,
} from '../../data/config/MetricConfigTypes'
import {
  AGE_ADJUST_COVID_DEATHS_US_SETTING,
  AGE_ADJUST_COVID_HOSP_US_SETTING,
  EXPLORE_DATA_PAGE_LINK,
} from '../../utils/internalRoutes'

const dataTypeLinkMap: Partial<Record<DataTypeId, string>> = {
  covid_deaths: AGE_ADJUST_COVID_DEATHS_US_SETTING,
  covid_hospitalizations: AGE_ADJUST_COVID_HOSP_US_SETTING,
}

interface AltDataTypesMessageProps {
  ageAdjustedDataTypes: DataTypeConfig[]
  setDataTypeConfigWithParam?: any
}
export default function AltDataTypesMessage(props: AltDataTypesMessageProps) {
  if (!props.ageAdjustedDataTypes) return <></>
  return (
    <>
      {' '}
      Age-adjusted ratios by race and ethnicity at the national and state levels
      are available for these alternate data types:{' '}
      {props.ageAdjustedDataTypes.map((dataType, i) => {
        return (
          <span key={dataType.fullDisplayName}>
            <a
              href={`${EXPLORE_DATA_PAGE_LINK}${
                dataTypeLinkMap[dataType.dataTypeId] ?? ''
              }#age-adjusted-ratios`}
            >
              {dataType.fullDisplayName}
            </a>
            {i < props.ageAdjustedDataTypes.length - 1 && ', '}
            {i === props.ageAdjustedDataTypes.length - 1 && '.'}
          </span>
        )
      })}
    </>
  )
}
