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
      <div className='inline-flex flex-row'>
        <span>
          <Typography
            className='text-left font-sansText text-small text-alt-black'
            onClick={handleDrawerOpen}
          >
            {' '}
            {topic.toLowerCase()}{' '}
          </Typography>
        </span>

        <Drawer anchor='bottom' open={isDrawerOpen} onClose={handleDrawerClose}>
          <div style={{ padding: '16px' }}>
            <IconButton onClick={handleDrawerClose} style={{ float: 'right' }}>
              <CloseIcon />
            </IconButton>

            <h6 className='mt-8 font-sansText font-medium'>
              {topic.toLowerCase()}
            </h6>
            <Typography className='text-left font-sansText text-small text-alt-black'>
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
        placement='top-start'
        className='inline-flex flex-row'
      >
        <Typography
          className='text-left font-sansText text-small text-alt-black'
          onClick={handleTooltipOpen}
        >
          {' '}
          {topic.toLowerCase()}{' '}
        </Typography>
      </Tooltip>
    </ClickAwayListener>
  )
}

export default DefinitionTooltip
