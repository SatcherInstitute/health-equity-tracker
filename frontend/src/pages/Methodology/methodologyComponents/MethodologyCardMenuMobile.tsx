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

interface LinkItem {
  index: number
  to: string
  primary?: string
  secondary?: string
  paddingLeft?: number
}

export const links: LinkItem[] = [
  { index: 0, to: NEW_METHODOLOGY_PAGE_LINK, primary: 'Methodology' },
  { index: 1, to: NEW_AGE_ADJUSTMENT_LINK, primary: 'Age-Adjustment' },
  { index: 2, to: SOURCES_LINK, primary: 'Data Sources' },
  { index: 3, to: TOPICS_LINK, primary: 'Categories and Limitations' },
  {
    index: 4,
    to: BEHAVIORAL_HEALTH_LINK,
    secondary: 'Behavioral Health',
    paddingLeft: 5,
  },
  {
    index: 5,
    to: CHRONIC_DISEASE_LINK,
    secondary: 'Chronic Diseases',
    paddingLeft: 4,
  },
  { index: 6, to: COVID_19_LINK, secondary: 'COVID-19', paddingLeft: 4 },
  { index: 7, to: HIV_LINK, secondary: 'HIV', paddingLeft: 4 },
  {
    index: 8,
    to: PDOH_LINK,
    secondary: 'Political Determinants of Health (PDOH)',
    paddingLeft: 4,
  },
  {
    index: 9,
    to: SDOH_LINK,
    secondary: 'Social Determinants of Health (SDOH)',
    paddingLeft: 4,
  },
  {
    index: 10,
    to: DATA_METHOD_DEFINITIONS_LINK,
    primary: 'Data Method Definitions',
  },
  { index: 11, to: METRICS_LINK, secondary: 'Metrics', paddingLeft: 4 },
  {
    index: 12,
    to: CONDITION_VARIABLES_LINK,
    secondary: 'Condition Variables',
    paddingLeft: 4,
  },
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
]

export default function MethodologyCardMenuMobile() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [showScrollTop, setShowScrollTop] = useState(false) // State to track visibility of the FAB
  const history = useHistory()

  const handleSelected = (event: any) => {
    setSelectedIndex(event.target.value as number)
    const selectedLink = links.find((link) => link.index === event.target.value)
    if (selectedLink) {
      history.push(selectedLink.to)
    }
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
      <div className='sticky top-0 z-z-almost-top flex items-center justify-center rounded-sm bg-white p-1 shadow-raised-tighter'>
        <Toolbar>
          <FormControl sx={{ minWidth: '90vw' }} size='medium'>
            <InputLabel id='methodology-select-label'>Jump to</InputLabel>
            <Select
              labelId='methodology-select-label'
              value={selectedIndex}
              onChange={handleSelected}
              label='Sections'
            >
              {links.map((link, idx) => (
                <MenuItem key={idx} value={link.index} className=''>
                  {link.primary ? link.primary : link.secondary}
                </MenuItem>
              ))}
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
          className='fixed bottom-2 right-2 z-z-top bg-alt-green'
          onClick={scrollTop}
        >
          <KeyboardArrowUpIcon />
        </Fab>
      )}
    </>
  )
}
