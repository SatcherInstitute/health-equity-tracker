import styles from './MethodologyPage.module.scss'
import * as React from 'react'
import List from '@mui/material/List'
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
} from '../../utils/internalRoutes'

function MethodologyCardMenu() {
  const [selectedIndex, setSelectedIndex] = React.useState(1)
  const handleSelected = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    index: number
  ) => {
    setSelectedIndex(index)
  }

  return (
    <nav className={styles.CardMenu}>
      <Box sx={{ width: '100%' }}>
        <List component="nav" aria-label="main methodology categories">
          <Link to={AGE_ADJUSTMENT_LINK}>
            <ListItemButton
              selected={selectedIndex === 0}
              onClick={(event) => {
                handleSelected(event, 0)
              }}
            >
              <ListItemText primary="Age-Adjustment" />
            </ListItemButton>
          </Link>
          <Divider />
          <Link to={SOURCES_LINK}>
            <ListItemButton
              selected={selectedIndex === 1}
              onClick={(event) => {
                handleSelected(event, 1)
              }}
            >
              <ListItemText primary="Source Acquisition" />
            </ListItemButton>
          </Link>
        </List>
        <Divider />
        <List component="nav" aria-label="topic definitions and limitations">
          <Link to={TOPICS_LINK}>
            <ListItemButton
              selected={selectedIndex === 2}
              onClick={(event) => {
                handleSelected(event, 2)
              }}
            >
              <ListItemText primary="Topic Definitions and Limitations" />
            </ListItemButton>
          </Link>

          <List component="div" disablePadding>
            <Link to={BEHAVIORAL_HEALTH_LINK}>
              <ListItemButton
                selected={selectedIndex === 3}
                onClick={(event) => {
                  handleSelected(event, 3)
                }}
                sx={{ pl: 4 }}
              >
                <ListItemText secondary="Behavioral Health" />
              </ListItemButton>
            </Link>

            <Link to={CHRONIC_DISEASE_LINK}>
              <ListItemButton
                selected={selectedIndex === 4}
                onClick={(event) => {
                  handleSelected(event, 4)
                }}
                sx={{ pl: 4 }}
              >
                <ListItemText secondary="Chronic Disease" />
              </ListItemButton>
            </Link>
            <Link to={COVID_19_LINK}>
              <ListItemButton
                selected={selectedIndex === 5}
                onClick={(event) => {
                  handleSelected(event, 5)
                }}
                sx={{ pl: 4 }}
              >
                <ListItemText secondary="COVID-19" />
              </ListItemButton>
            </Link>
            <Link to={HIV_LINK}>
              <ListItemButton
                selected={selectedIndex === 6}
                onClick={(event) => {
                  handleSelected(event, 6)
                }}
                sx={{ pl: 4 }}
              >
                <ListItemText secondary="HIV" />
              </ListItemButton>
            </Link>

            <Link to={PDOH_LINK}>
              <ListItemButton
                selected={selectedIndex === 7}
                onClick={(event) => {
                  handleSelected(event, 7)
                }}
                sx={{ pl: 4 }}
              >
                <ListItemText secondary="Political Determinants of Health (PDOH)" />
              </ListItemButton>
            </Link>

            <Link to={SDOH_LINK}>
              <ListItemButton
                selected={selectedIndex === 8}
                onClick={(event) => {
                  handleSelected(event, 8)
                }}
                sx={{ pl: 4 }}
              >
                <ListItemText secondary="Social Determinants of Health (SDOH)" />
              </ListItemButton>
            </Link>
          </List>
        </List>
        <Divider />

        <List component="nav" aria-label="data method definitions">
          <Link to={DATA_METHOD_DEFINITIONS_LINK}>
            <ListItemButton
              selected={selectedIndex === 9}
              onClick={(event) => {
                handleSelected(event, 9)
              }}
            >
              <ListItemText primary="Data Method Definitions" />
            </ListItemButton>
          </Link>

          <List component="div" disablePadding>
            <Link to={METRICS_LINK}>
              <ListItemButton
                selected={selectedIndex === 10}
                onClick={(event) => {
                  handleSelected(event, 10)
                }}
                sx={{ pl: 4 }}
              >
                <ListItemText secondary="Metrics" />
              </ListItemButton>
            </Link>
            <Link to={CONDITION_VARIABLES_LINK}>
              <ListItemButton
                selected={selectedIndex === 11}
                onClick={(event) => {
                  handleSelected(event, 11)
                }}
                sx={{ pl: 4 }}
              >
                <ListItemText secondary="Condition Variables" />
              </ListItemButton>
            </Link>
            <Link to={RACES_AND_ETHNICITIES_LINK}>
              <ListItemButton
                selected={selectedIndex === 12}
                onClick={(event) => {
                  handleSelected(event, 12)
                }}
                sx={{ pl: 4 }}
              >
                <ListItemText secondary="Races and Ethnicities" />
              </ListItemButton>
            </Link>
          </List>
        </List>
        <Divider />
        <List component="nav" aria-label="recommended citation">
          <Link to={RECOMMENDED_CITATION_LINK}>
            <ListItemButton
              selected={selectedIndex === 13}
              onClick={(event) => {
                handleSelected(event, 13)
              }}
            >
              <ListItemText primary="Recommended Citation" />
            </ListItemButton>
          </Link>
        </List>
      </Box>
    </nav>
  )
}

export default MethodologyCardMenu
