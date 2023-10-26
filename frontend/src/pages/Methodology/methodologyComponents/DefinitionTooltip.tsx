import React, { useState } from 'react'
import Tooltip from '@mui/material/Tooltip'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import {
  ClickAwayListener,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'

import styles from '../methodologyComponents/MethodologyPage.module.scss'
import { InfoOutlined } from '@mui/icons-material'

// interface DefinitionTooltipProps {
//   topic: string
//   definitionsGlossary: Array<{
//     topic: string
//     definitions: Array<{
//       key: string
//       description: string
//     }>
//   }>
//   id?: string
// }

interface DefinitionTooltipProps {
  topic: string
  definitionItem: {
    topic: string
    definitions: Array<{
      key: string
      description: string
    }>
  }
  id?: string
}

const DefinitionTooltip: React.FC<DefinitionTooltipProps> = ({
  definitionItem,
  topic,
}) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [isDrawerOpen, setDrawerOpen] = useState(false)
  const [open, setOpen] = useState(false)

  const handleTooltipClose = () => {
    setOpen(false)
  }
  const handleTooltipOpen = () => {
    setOpen(true)
  }
  const handleDrawerOpen = () => {
    setDrawerOpen(true)
  }
  const handleDrawerClose = () => {
    setDrawerOpen(false)
  }

  const measurementDescription = definitionItem.definitions.find(
    (def: { key: string }) => def.key === 'Measurement Definition'
  )?.description

  if (isMobile) {
    return (
      <div className={styles.Tooltip}>
        <span>
          <Typography
            className={styles.MethodologyAnswer}
            onClick={handleDrawerOpen}
          >
            {' '}
            {topic.toLowerCase()}{' '}
          </Typography>
        </span>

        <Drawer anchor="bottom" open={isDrawerOpen} onClose={handleDrawerClose}>
          <div style={{ padding: '16px' }}>
            <IconButton onClick={handleDrawerClose} style={{ float: 'right' }}>
              <CloseIcon />
            </IconButton>

            <Typography
              className={styles.MethodologySubsubheaderText}
              variant="h6"
            >
              {topic.toLowerCase()}
            </Typography>
            <Typography className={styles.MethodologyAnswer}>
              {measurementDescription}
            </Typography>
          </div>
        </Drawer>
      </div>
    )
  }

  return (
    <ClickAwayListener onClickAway={handleTooltipClose}>
      <Tooltip
        disableFocusListener
        disableTouchListener
        onClose={handleTooltipClose}
        open={open}
        title={measurementDescription}
        arrow
        placement="top-start"
        className={styles.Tooltip}
      >
        <span className={styles.Tooltip}>
          <Typography
            className={styles.MethodologyAnswer}
            onClick={handleTooltipOpen}
          >
            {' '}
            {topic.toLowerCase()}{' '}
          </Typography>
        </span>
      </Tooltip>
    </ClickAwayListener>
  )
}

export default DefinitionTooltip
