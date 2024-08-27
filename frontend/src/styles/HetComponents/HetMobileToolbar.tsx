import {
  Button,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Collapse,
  Toolbar,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import { useState } from 'react'
import { NAVIGATION_STRUCTURE } from '../../utils/urlutils'
import HetCTASmall from './HetCTASmall'
import { EXPLORE_DATA_PAGE_LINK } from '../../utils/internalRoutes'

export default function HetMobileAppToolbar() {
  const [open, setOpen] = useState(false)
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null)

  const handleToggle = (menuName: string) => {
    setExpandedMenu(expandedMenu === menuName ? null : menuName)
  }

  const renderNavItems = (structure: typeof NAVIGATION_STRUCTURE) => {
    return Object.entries(structure).map(([key, value]) => {
      if ('pages' in value) {
        return (
          <div key={key}>
            <ListItem button onClick={() => handleToggle(key)}>
              <ListItemText primary={value.label} />
              {expandedMenu === key ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={expandedMenu === key} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {Object.entries(value.pages).map(([subKey, subValue]) => (
                  <ListItemLink href={subKey} key={subKey} sx={{ pl: 4 }}>
                    <ListItemText primary={subValue} />
                  </ListItemLink>
                ))}
              </List>
            </Collapse>
          </div>
        )
      } else if ('link' in value) {
        return (
          <ListItemLink href={value.link} key={key}>
            <ListItemText primary={value.label} />
          </ListItemLink>
        )
      }
      return null
    })
  }

  return (
    <Toolbar>
      <IconButton
        onClick={() => setOpen(true)}
        aria-label='Expand site navigation'
        size='large'
      >
        <MenuIcon className='text-white' />
      </IconButton>
      <Drawer variant='temporary' anchor='left' open={open} onClose={() => setOpen(false)}>
        <Button
          aria-label='Collapse site navigation'
          onClick={() => setOpen(false)}
        >
          <ChevronLeftIcon />
        </Button>
        <nav>
          <List>
            {renderNavItems(NAVIGATION_STRUCTURE)}
            <HetCTASmall id='navigationCTA' href={EXPLORE_DATA_PAGE_LINK}>
            Explore the data
          </HetCTASmall>
          </List>
          
        </nav>
      </Drawer>
    </Toolbar>
  )
}

function ListItemLink(props: any) {
  return <ListItem button component='a' {...props} />
}