import { useState } from 'react'
import { Toolbar, Menu, MenuItem } from '@mui/material'
import AppBarLogo from '../../assets/AppbarLogo.png'
import { NAVIGATION_STRUCTURE } from '../../utils/urlutils'
import HetNavLink from './HetNavLink'
import HetNavButton from './HetNavButton'
import HetCTABig from './HetCTABig'
import { EXPLORE_DATA_PAGE_LINK } from '../../utils/internalRoutes'

export default function HetAppToolbar() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>, menuName: string) => {
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
          <div className='relative' key={key}>
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
              {Object.entries(value.pages).map(([subKey, subValue]) => (
                <MenuItem key={subKey} onClick={handleClose}>
                  <HetNavLink href={subKey}>{subValue}</HetNavLink>
                </MenuItem>
              ))}
            </Menu>
          </div>
        )
      } else if ('link' in value) {
        return (
          <HetNavLink
            key={key}
            href={value.link}
            className='my-0 w-auto p-0 font-sansTitle text-small font-medium text-navlinkColor'
          >
            {value.label}
          </HetNavLink>
        )
      }
      return null
    })
  }

  return (
    <Toolbar className='flex min-h-[65px] justify-between border-0 border-b border-solid border-black bg-white leading-lhSomeSpace'>
      <h1 className='m-0'>
        <HetNavLink className='flex items-center pl-0' href='/'>
          <img
            src={AppBarLogo}
            className='h-littleHetLogo w-littleHetLogo'
            alt='Health Equity Tracker logo'
          />
          <span className='grow pl-5 text-left font-sansTitle text-navBarHeader font-medium leading-lhSomeSpace text-altGreen no-underline'>
            Health Equity Tracker
          </span>
        </HetNavLink>
      </h1>

      <nav className='flex max-w-sm flex-wrap justify-evenly lg:max-w-lg'>
        {renderNavItems(NAVIGATION_STRUCTURE)}
        <HetCTABig id='landingPageCTA' href={EXPLORE_DATA_PAGE_LINK}>
            Explore the data
          </HetCTABig>
      </nav>
    </Toolbar>
  )
}