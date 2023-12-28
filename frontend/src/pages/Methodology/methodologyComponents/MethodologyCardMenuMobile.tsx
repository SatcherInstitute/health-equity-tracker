import Toolbar from '@mui/material/Toolbar'
import { Select, FormControl, MenuItem, InputLabel } from '@mui/material'
import { useHistory } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Fab from '@mui/material/Fab'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import {
  NEW_METHODOLOGY_PAGE_LINK,
  NEW_AGE_ADJUSTMENT_LINK,
  SOURCES_LINK,
  TOPICS_LINK,
  BEHAVIORAL_HEALTH_LINK,
  CHRONIC_DISEASE_LINK,
  COVID_19_LINK,
  HIV_LINK,
  PDOH_LINK,
  SDOH_LINK,
  DATA_METHOD_DEFINITIONS_LINK,
  METRICS_LINK,
  CONDITION_VARIABLES_LINK,
  RACES_AND_ETHNICITIES_LINK,
  RECOMMENDED_CITATION_LINK,
  GLOSSARY_LINK,
} from '../../../utils/internalRoutes'

interface MethodologyCardMenuMobileProps {
  className?: string
}

export default function MethodologyCardMenuMobile(
  props: MethodologyCardMenuMobileProps
) {
  const [showScrollTop, setShowScrollTop] = useState(false) // State to track visibility of the FAB
  const history = useHistory()

  const handleSelected = (event: any) => {
    history.push(event.target.value)
  }

  const checkScrollTop = () => {
    if (!showScrollTop && window.pageYOffset > window.innerHeight) {
      setShowScrollTop(true)
    } else if (showScrollTop && window.pageYOffset <= window.innerHeight) {
      setShowScrollTop(false)
    }
  }

  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    window.addEventListener('scroll', checkScrollTop)
    return () => {
      window.removeEventListener('scroll', checkScrollTop)
    }
  }, [])

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
              <MenuItem
                value={NEW_METHODOLOGY_PAGE_LINK}
                className='font-medium'
              >
                Methodology
              </MenuItem>
              <MenuItem value={NEW_AGE_ADJUSTMENT_LINK} className='font-medium'>
                Age-Adjustment
              </MenuItem>
              <MenuItem value={SOURCES_LINK} className='font-medium'>
                Data Sources
              </MenuItem>
              <MenuItem value={TOPICS_LINK} className='font-medium'>
                Categories and Limitations
              </MenuItem>
              <MenuItem
                value={BEHAVIORAL_HEALTH_LINK}
                className='pl-10 font-light'
              >
                Behavioral Health
              </MenuItem>
              <MenuItem
                value={CHRONIC_DISEASE_LINK}
                className='pl-10 font-light'
              >
                Chronic Diseases
              </MenuItem>
              <MenuItem value={COVID_19_LINK} className='pl-10 font-light'>
                COVID-19
              </MenuItem>
              <MenuItem value={HIV_LINK} className='pl-10 font-light'>
                HIV
              </MenuItem>
              <MenuItem value={PDOH_LINK} className='pl-10 font-light'>
                Political Determinants of Health (PDOH)
              </MenuItem>
              <MenuItem value={SDOH_LINK} className='pl-10 font-light'>
                Social Determinants of Health (SDOH)
              </MenuItem>
              <MenuItem
                value={DATA_METHOD_DEFINITIONS_LINK}
                className='font-medium'
              >
                Data Method Definitions
              </MenuItem>
              <MenuItem value={METRICS_LINK} className='font-medium'>
                Metrics
              </MenuItem>
              <MenuItem
                value={CONDITION_VARIABLES_LINK}
                className='font-medium'
              >
                Condition Variables
              </MenuItem>
              {/*
                {
    index: 13,
    to: RACES_AND_ETHNICITIES_LINK,
    secondary: 'Races and Ethnicities',
    paddingLeft: 4,
  },
  {
    index: 14,
    to: RECOMMENDED_CITATION_LINK,
    primary: 'Recommended Citation',
  },
  {
    index: 15,
    to: GLOSSARY_LINK,
    primary: 'Glossary',
  },
              */}
              <MenuItem
                value={RACES_AND_ETHNICITIES_LINK}
                className='pl-10 font-light'
              >
                Races and Ethnicities
              </MenuItem>
              <MenuItem
                value={RECOMMENDED_CITATION_LINK}
                className='pl-10 font-light'
              >
                Recommended Citation
              </MenuItem>
              <MenuItem value={GLOSSARY_LINK} className='pl-10 font-light'>
                Glossary
              </MenuItem>
            </Select>
          </FormControl>
        </Toolbar>
      </div>
      {showScrollTop && (
        <Fab
          color='secondary'
          size='small'
          aria-label='scroll back to top'
          // className={styles.Fab}
          className='bg-alt-green fixed bottom-2 right-2 z-top'
          onClick={scrollTop}
        >
          <KeyboardArrowUpIcon />
        </Fab>
      )}
    </>
  )
}
