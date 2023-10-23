import React, { useState } from 'react'
import Tooltip from '@mui/material/Tooltip'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import {
  ClickAwayListener,
  Typography,
  styled,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import DefinitionGlossary from '../methodologyContent/DefinitionGlossary'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import styles from '../methodologyComponents/MethodologyPage.module.scss'

interface DefinitionTooltipProps {
  term: keyof typeof DefinitionGlossary
}

const DefinitionTooltip: React.FC<DefinitionTooltipProps> = ({ term }) => {
  const definition = DefinitionGlossary[term]
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

  if (isMobile) {
    return (
      <div className={styles.Tooltip}>
        <Tooltip
          PopperProps={{
            disablePortal: true,
          }}
          title={definition}
          arrow
          placement="top-start"
          className={styles.Tooltip}
        >
          <Typography
            className={styles.MethodologyAnswer}
            onClick={handleDrawerOpen}
          >
            {term}
            <HelpOutlineIcon />
          </Typography>
        </Tooltip>

        <Drawer anchor="bottom" open={isDrawerOpen} onClose={handleDrawerClose}>
          <div style={{ padding: '16px' }}>
            <IconButton onClick={handleDrawerClose} style={{ float: 'right' }}>
              <CloseIcon />
            </IconButton>
            <Typography
              className={styles.MethodologySubsubheaderText}
              variant="h6"
            >
              {term}
            </Typography>
            <Typography className={styles.MethodologyAnswer}>
              {definition}
            </Typography>
          </div>
        </Drawer>
      </div>
    )
  }

  return (
    <ClickAwayListener onClickAway={handleTooltipClose}>
      <div className={styles.Tooltip}>
        <Tooltip
          disableFocusListener
          disableTouchListener
          onClose={handleTooltipClose}
          open={open}
          title={definition}
          arrow
          placement="top-start"
          className={styles.Tooltip}
        >
          <Typography
            className={styles.MethodologyAnswer}
            onClick={handleTooltipOpen}
          >
            {term}
            <HelpOutlineIcon />
          </Typography>
        </Tooltip>
      </div>
    </ClickAwayListener>
  )
}

export default DefinitionTooltip
