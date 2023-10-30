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
  METHODOLOGY_PAGE_LINK,
  GLOSSARY_LINK,
} from '../../../utils/internalRoutes'
import { useState } from 'react'

interface LinkItem {
  index: number
  to: string
  primary?: string
  secondary?: string
  paddingLeft?: number
}

export const links: LinkItem[] = [
  { index: 0, to: METHODOLOGY_PAGE_LINK, primary: 'Methodology' },
  { index: 1, to: AGE_ADJUSTMENT_LINK, primary: 'Age-Adjustment' },
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

const MethodologyCardMenu: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const handleSelected = (index: number) => {
    setSelectedIndex(index)
  }

  const shouldDisplayDivider = (currentIndex: number) => {
    if (currentIndex === links.length - 1) return false // No divider for the last item

    const currentLink = links[currentIndex]
    const nextLink = links[currentIndex + 1]

    if (currentLink.primary && nextLink?.secondary) {
      return false // If current is primary and next is secondary, don't show divider
    }

    if (currentLink.primary && (nextLink?.primary ?? !nextLink)) {
      return true // If current is secondary and next is primary or there's no next link, show divider
    }
    if (currentLink.secondary && (nextLink?.primary ?? !nextLink)) {
      return true // If current is secondary and next is primary or there's no next link, show divider
    }

    return false
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
            {shouldDisplayDivider(idx) && <Divider />}
          </React.Fragment>
        ))}
      </Box>
    </nav>
  )
}

export default MethodologyCardMenu

// const MethodologyCardMenu: React.FC = () => {
//   const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

//   const handleSelected = (index: number) => {
//     setSelectedIndex(index)
//   }

//   return (
//     <nav className={styles.CardMenu}>
//       <Box sx={{ width: '100%' }}>
//         {links.map((link, idx) => (
//           <React.Fragment key={idx}>
//             <Link to={link.to}>
//               <ListItemButton
//                 selected={selectedIndex === link.index}
//                 onClick={() => {
//                   handleSelected(link.index)
//                 }}
//                 sx={{ pl: link.paddingLeft ?? 0 }}
//               >
//                 <ListItemText
//                   primary={link.primary}
//                   secondary={link.secondary}
//                 />
//               </ListItemButton>
//             </Link>
//             {idx !== links.length - 1 && <Divider />}
//           </React.Fragment>
//         ))}
//       </Box>
//     </nav>
//   )
// }

// export default MethodologyCardMenu
