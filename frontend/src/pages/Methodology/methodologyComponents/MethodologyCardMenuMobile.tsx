import Toolbar from '@mui/material/Toolbar'
import { Select, FormControl, MenuItem, InputLabel } from '@mui/material'
import { useHistory } from 'react-router-dom'
import {
  NEW_METHODOLOGY_PAGE_LINK,
  NEW_AGE_ADJUSTMENT_LINK,
  SOURCES_LINK,
  TOPIC_CATEGORIES_LINK,
  BEHAVIORAL_HEALTH_LINK,
  CHRONIC_DISEASE_LINK,
  COVID_19_LINK,
  HIV_LINK,
  PDOH_LINK,
  SDOH_LINK,
  DATA_METHOD_DEFINITIONS_LINK,
  METRICS_LINK,
  TOPIC_DEFINITIONS_LINK,
  RACES_AND_ETHNICITIES_LINK,
  RECOMMENDED_CITATION_LINK,
  GLOSSARY_LINK,
  MEDICARE_MEDICATION_LINK,
} from '../../../utils/internalRoutes'

interface MethodologyCardMenuMobileProps {
  className?: string
}

export default function MethodologyCardMenuMobile(
  props: MethodologyCardMenuMobileProps
) {
  const history = useHistory()

  const handleSelected = (event: any) => {
    history.push(event.target.value)
  }

  return (
    <>
      <div
        className={`top-0 z-almostTop flex items-center rounded-sm bg-white p-1 sm:items-start sm:justify-start md:justify-center ${
          props.className ?? ''
        }`}
      >
        <Toolbar className='w-full'>
          <FormControl sx={{ minWidth: '90vw' }} size='medium'>
            <InputLabel id='methodology-select-label'>
              Methodology Pages
            </InputLabel>
            <Select
              labelId='methodology-select-label'
              value={window.location.pathname}
              onChange={handleSelected}
              label='Methodology Pages'
            >
              <MenuItem value={NEW_METHODOLOGY_PAGE_LINK}>
                Introduction
              </MenuItem>
              <MenuItem value={NEW_AGE_ADJUSTMENT_LINK}>
                Age-Adjustment
              </MenuItem>
              <MenuItem value={SOURCES_LINK}>Data Sources</MenuItem>
              <MenuItem value={TOPIC_CATEGORIES_LINK}>
                Topic Categories & Limitations
              </MenuItem>
              <MenuItem value={BEHAVIORAL_HEALTH_LINK}>
                Behavioral Health
              </MenuItem>
              <MenuItem value={CHRONIC_DISEASE_LINK}>Chronic Diseases</MenuItem>
              <MenuItem value={COVID_19_LINK}>COVID-19</MenuItem>
              <MenuItem value={HIV_LINK}>HIV</MenuItem>
              <MenuItem value={PDOH_LINK}>
                Political Determinants of Health (PDOH)
              </MenuItem>
              <MenuItem value={SDOH_LINK}>
                Social Determinants of Health (SDOH)
              </MenuItem>
              <MenuItem value={MEDICARE_MEDICATION_LINK}>
                Medicare Medication Usage
              </MenuItem>
              <MenuItem value={DATA_METHOD_DEFINITIONS_LINK}>
                Data Method Definitions
              </MenuItem>
              <MenuItem value={METRICS_LINK}>Metrics</MenuItem>
              <MenuItem value={TOPIC_DEFINITIONS_LINK}>
                Topic Definitions
              </MenuItem>

              <MenuItem value={RACES_AND_ETHNICITIES_LINK}>
                Races and Ethnicities
              </MenuItem>
              <MenuItem value={RECOMMENDED_CITATION_LINK}>
                Recommended Citation
              </MenuItem>
              <MenuItem value={GLOSSARY_LINK}>Glossary</MenuItem>
            </Select>
          </FormControl>
        </Toolbar>
      </div>
    </>
  )
}
