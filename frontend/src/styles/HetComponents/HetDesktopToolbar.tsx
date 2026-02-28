import { Menu, MenuItem, Toolbar } from '@mui/material'
import { useState } from 'react'
import AppBarLogo from '../../assets/AppbarLogo.png'
import { EXPLORE_DATA_PAGE_LINK } from '../../utils/internalRoutes'
import { NAVIGATION_STRUCTURE } from '../../utils/urlutils'
import HetCTASmall from './HetCTASmall'
import HetLaunchLink from './HetLaunchLink'
import HetNavButton from './HetNavButton'
import HetNavLink from './HetNavLink'

export default function HetAppToolbar() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  const handleClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    menuName: string,
  ) => {
    setAnchorEl(event.currentTarget)
    setActiveMenu(menuName)
  }

  const handleClose = () => {
    setAnchorEl(null)
    setActiveMenu(null)
  }

  const renderNavItems = (structure: typeof NAVIGATION_STRUCTURE) => {
    return Object.entries(structure).map(([key, value]) => {
      if ('pages' in value) {
        return (
          <div className='relative flex items-center' key={key}>
            <HetNavButton
              label={value.label}
              onClick={(e) => handleClick(e, key)}
              isExpanded={activeMenu === key}
            />
            <Menu
              anchorEl={anchorEl}
              open={activeMenu === key}
              onClose={handleClose}
              classes={{ paper: 'bg-white' }}
            >
              {Object.entries(value.pages).map(([subKey, subValue]) => {
                const isExternal =
                  typeof subValue === 'object'
                    ? subValue.isExternal
                    : subKey.startsWith('https://') ||
                      subKey.startsWith('http://')
                const label =
                  typeof subValue === 'string' ? subValue : subValue.label

                return (
                  <MenuItem key={subKey} onClick={handleClose}>
                    <div className='flex items-center gap-2'>
                      <HetNavLink
                        href={subKey}
                        {...(isExternal && {
                          target: '_blank',
                          rel: 'noopener noreferrer',
                        })}
                      >
                        {label}
                      </HetNavLink>
                      {isExternal && (
                        <HetLaunchLink
                          svgClassName='flex my-auto text-text'
                          href={subKey}
                        />
                      )}
                    </div>
                  </MenuItem>
                )
              })}
            </Menu>
          </div>
        )
      }

      if ('link' in value) {
        const isExternal =
          value.isExternal ||
          value.link.startsWith('https://') ||
          value.link.startsWith('http://')

        return (
          <div key={key} className='flex items-center gap-1'>
            <HetNavLink
              href={value.link}
              className='mx-2 my-0 w-auto px-2 font-medium font-sans-title text-navlink-color text-small'
              {...(isExternal && {
                target: '_blank',
                rel: 'noopener noreferrer',
              })}
            >
              {value.label}
            </HetNavLink>
            {isExternal && <HetLaunchLink href={value.link} />}
          </div>
        )
      }

      return null
    })
  }

  return (
    <Toolbar className='flex min-h-[65px] justify-between border-0 border-black border-b border-solid bg-white leading-some-space'>
      <nav aria-label='home navigation' className='m-0'>
        <HetNavLink className='flex items-center pl-0' href='/'>
          <img
            src={AppBarLogo}
            className='h-little-het-logo w-little-het-logo'
            alt='Health Equity Tracker logo'
          />
          <span className='xs:hidden grow pl-5 text-left font-medium font-sans-title text-alt-green text-nav-bar-header leading-some-space no-underline lg:flex'>
            Health Equity Tracker
          </span>
        </HetNavLink>
      </nav>

      <nav
        aria-label='page navigation'
        className='flex flex-wrap justify-evenly'
      >
        {renderNavItems(NAVIGATION_STRUCTURE)}
        <HetCTASmall
          id='navigationCTA'
          href={EXPLORE_DATA_PAGE_LINK}
          className='ml-4'
        >
          Explore the data
        </HetCTASmall>
      </nav>
    </Toolbar>
  )
}
