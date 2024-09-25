import {
  Drawer,
  IconButton,
  List,
  ListItemText,
  Collapse,
  Toolbar,
  ListItemButton,
  ListItem,
} from '@mui/material'
import {
  Close,
  ExpandLess,
  ExpandMore,
  Menu as MenuIcon,
} from '@mui/icons-material'
import { useState } from 'react'
import { NAVIGATION_STRUCTURE } from '../../utils/urlutils'
import HetCTASmall from './HetCTASmall'
import { EXPLORE_DATA_PAGE_LINK } from '../../utils/internalRoutes'
import HetNavLink from './HetNavLink'
import AppBarLogo from '../../assets/AppbarLogo.png'
import { Link } from 'react-router-dom'

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
            <ListItemButton
              onClick={() => handleToggle(key)}
              className='w-full'
            >
              <ListItemText primary={value.label} />
              {expandedMenu === key ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={expandedMenu === key} timeout='auto' unmountOnExit>
              {Object.entries(value.pages).map(([subKey, subValue]) => (
                <ListItem
                  key={subKey}
                  component={Link}
                  to={subKey}
                  className='pl-8  no-underline'
                  onClick={() => setOpen(false)}
                >
                  <ListItemText className='text-altBlack' primary={subValue} />
                </ListItem>
              ))}
            </Collapse>
          </div>
        )
      }

      if ('link' in value) {
        return (
          <ListItem
            onClick={() => setOpen(false)}
            component={Link}
            to={value.link}
            key={key}
          >
            <ListItemText className='text-altBlack' primary={value.label} />
          </ListItem>
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
        sx={{ borderRadius: 1 }}
      >
        <MenuIcon className='text-white' />
      </IconButton>
      <Drawer
        variant='temporary'
        anchor='left'
        open={open}
        onClose={() => setOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: '16rem',
            maxWidth: '100%',
            padding: '0 16px',
          },
        }}
      >
        <div className='flex flex-row items-center'>
          <HetNavLink className='flex items-center pl-0' href='/'>
            <img
              src={AppBarLogo}
              className='h-littleHetLogo w-littleHetLogo ml-2 mr-auto'
              alt='Health Equity Tracker logo'
            />
          </HetNavLink>
          <IconButton
            aria-label='Collapse site navigation'
            onClick={() => setOpen(false)}
            className='p-2.5 ml-auto mx-2 my-4 text-altBlack'
            sx={{ borderRadius: 1 }}
          >
            <Close />
          </IconButton>
        </div>

        <nav>
          <List className='flex flex-col justify-center pt-0'>
            {renderNavItems(NAVIGATION_STRUCTURE)}
            <HetCTASmall
              className='my-4'
              id='navigationCTA'
              href={EXPLORE_DATA_PAGE_LINK}
            >
              Explore the data
            </HetCTASmall>
          </List>
        </nav>
      </Drawer>
    </Toolbar>
  )
}
