import type React from 'react'
import { useState, useEffect } from 'react'
import { Fips } from '../data/utils/Fips'
import { METRIC_CONFIG } from '../data/config/MetricConfig'
import MapCard from '../cards/MapCard'
import {
  type MadLib,
  MADLIB_LIST,
  getMadLibWithUpdatedValue,
} from '../utils/MadLibs'

interface Custom100kMapProps {
  openMultiMap: boolean
}

const Custom100kMap: React.FC<Custom100kMapProps> = ({ openMultiMap }) => {
  const initialMadLib = MADLIB_LIST.find((madLib) => madLib.id === 'disparity')!
  const [madLib, setMadLib] = useState<MadLib>(initialMadLib)
  const [multimapOpen, setMultimapOpen] = useState(openMultiMap)

  const fips = new Fips('00')
  const dataTypeConfig = METRIC_CONFIG['medicare_hiv'][0]
  const reportTitle = 'Example Report Title'

  const updateFipsCallback = (fips: Fips) => {
    setMadLib(getMadLibWithUpdatedValue(madLib, 3, fips.code))
  }

  useEffect(() => {
    setMultimapOpen(openMultiMap)
  }, [openMultiMap])

  return (
    <div>
      <MapCard
        dataTypeConfig={dataTypeConfig}
        fips={fips}
        updateFipsCallback={updateFipsCallback}
        demographicType='race_and_ethnicity'
        reportTitle={reportTitle}
        trackerMode={madLib.id}
      />
    </div>
  )
}

export default Custom100kMap
