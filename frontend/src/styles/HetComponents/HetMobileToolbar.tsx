import {
  Close,
  ExpandLess,
  ExpandMore,
  LaunchRounded,
  Menu as MenuIcon,
} from '@mui/icons-material'
import {
  Collapse,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
} from '@mui/material'
import { useState } from 'react'
import { Link } from 'react-router'
import AppBarLogo from '../../assets/AppbarLogo.png'
import { NAVIGATION_STRUCTURE } from '../../pages/navigationData'
import { EXPLORE_DATA_PAGE_LINK } from '../../utils/internalRoutes'
import { isExternalLink } from '../../utils/urlutils'
import HetCTASmall from './HetCTASmall'
import HetNavLink from './HetNavLink'

export default function HetMobileToolbar() {
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
              {Object.entries(value.pages).map(([subKey, subValue]) => {
                const external = isExternalLink(subKey)
                const label =
                  typeof subValue === 'string' ? subValue : subValue.label

                return (
                  <ListItem
                    key={subKey}
                    component={external ? 'a' : Link}
                    {...(external
                      ? {
                          href: subKey,
                          target: '_blank',
                          rel: 'noopener noreferrer',
                        }
                      : { to: subKey })}
                    className='pl-8 no-underline'
                    onClick={() => setOpen(false)}
                  >
                    <div className='flex w-full items-center justify-between gap-2'>
                      <ListItemText
                        className='text-alt-black'
                        primary={label}
                      />
                      {external && (
                        <LaunchRounded className='my-auto text-alt-black' />
                      )}
                    </div>
                  </ListItem>
                )
              })}
            </Collapse>
          </div>
        )
      }

      if ('link' in value) {
        const external = isExternalLink(value.link)

        return external ? (
          <ListItem
            key={key}
            component='a'
            href={value.link}
            target='_blank'
            rel='noopener noreferrer'
            onClick={() => setOpen(false)}
          >
            <div className='flex w-full items-center justify-between gap-2'>
              <ListItemText className='text-alt-black' primary={value.label} />
              <LaunchRounded className='my-auto text-alt-black' />
            </div>
          </ListItem>
        ) : (
          <ListItem
            onClick={() => setOpen(false)}
            component={Link}
            to={value.link}
            key={key}
          >
            <ListItemText className='text-alt-black' primary={value.label} />
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
              className='mr-auto ml-2 h-little-het-logo w-little-het-logo'
              alt='Health Equity Tracker logo'
            />
          </HetNavLink>
          <IconButton
            aria-label='Collapse site navigation'
            onClick={() => setOpen(false)}
            className='mx-2 my-4 ml-auto p-2.5 text-alt-black'
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
              onClick={() => setOpen(false)}
            >
              Explore the data
            </HetCTASmall>
          </List>
        </nav>
      </Drawer>
    </Toolbar>
  )
}
