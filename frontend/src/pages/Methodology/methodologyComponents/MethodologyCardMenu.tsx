import styles from './MethodologyPage.module.scss'
import * as React from 'react'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import { Link } from 'react-router-dom'
import {
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
  AGE_ADJUSTMENT_LINK,
} from '../../../utils/internalRoutes'
import { useState } from 'react'

interface LinkItem {
  index: number
  to: string
  primary?: string
  secondary?: string
  paddingLeft?: number
}

const links: LinkItem[] = [
  { index: 0, to: AGE_ADJUSTMENT_LINK, primary: 'Age-Adjustment' },
  { index: 1, to: SOURCES_LINK, primary: 'Source Acquisition' },
  { index: 2, to: TOPICS_LINK, primary: 'Topic Definitions and Limitations' },
  {
    index: 3,
    to: BEHAVIORAL_HEALTH_LINK,
    secondary: 'Behavioral Health',
    paddingLeft: 4,
  },
  {
    index: 4,
    to: CHRONIC_DISEASE_LINK,
    secondary: 'Chronic Diseases',
    paddingLeft: 4,
  },
  { index: 5, to: COVID_19_LINK, secondary: 'COVID-19', paddingLeft: 4 },
  { index: 6, to: HIV_LINK, secondary: 'HIV', paddingLeft: 4 },
  {
    index: 7,
    to: PDOH_LINK,
    secondary: 'Political Determinants of Health (PDOH)',
    paddingLeft: 4,
  },
  {
    index: 8,
    to: SDOH_LINK,
    secondary: 'Social Determinants of Health (SDOH)',
    paddingLeft: 4,
  },
  {
    index: 9,
    to: DATA_METHOD_DEFINITIONS_LINK,
    primary: 'Data Method Definitions',
  },
  { index: 10, to: METRICS_LINK, secondary: 'Metrics', paddingLeft: 4 },
  {
    index: 11,
    to: CONDITION_VARIABLES_LINK,
    secondary: 'Condition Variables',
    paddingLeft: 4,
  },
  {
    index: 12,
    to: RACES_AND_ETHNICITIES_LINK,
    secondary: 'Races and Ethnicities',
    paddingLeft: 4,
  },
  {
    index: 13,
    to: RECOMMENDED_CITATION_LINK,
    primary: 'Recommended Citation (APA)',
  },
]

const MethodologyCardMenu: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const handleSelected = (index: number) => {
    setSelectedIndex(index)
  }

  return (
    <nav className={styles.CardMenu}>
      <Box sx={{ width: '100%' }}>
        {links.map((link, idx) => (
          <React.Fragment key={idx}>
            <Link to={link.to}>
              <ListItemButton
                selected={selectedIndex === link.index}
                onClick={() => {
                  handleSelected(link.index)
                }}
                sx={{ pl: link.paddingLeft ?? 0 }}
              >
                <ListItemText
                  primary={link.primary}
                  secondary={link.secondary}
                />
              </ListItemButton>
            </Link>
            {idx !== links.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </Box>
    </nav>
  )
}

export default MethodologyCardMenu
