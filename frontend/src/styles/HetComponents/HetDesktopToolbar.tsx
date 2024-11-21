import { Menu, MenuItem, Toolbar } from '@mui/material'
import { useState } from 'react'
import AppBarLogo from '../../assets/AppbarLogo.png'
import { EXPLORE_DATA_PAGE_LINK } from '../../utils/internalRoutes'
import { NAVIGATION_STRUCTURE } from '../../utils/urlutils'
import HetCTALinkSmall from './HetCTALinkSmall'
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
              {Object.entries(value.pages).map(([subKey, subValue]) => (
                <MenuItem key={subKey} onClick={handleClose}>
                  <HetNavLink href={subKey}>{subValue}</HetNavLink>
                </MenuItem>
              ))}
            </Menu>
          </div>
        )
      }

      if ('link' in value) {
        return (
          <HetNavLink
            key={key}
            href={value.link}
            className='my-0 w-auto px-2 mx-2 font-sansTitle text-small font-medium text-navlinkColor'
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
          <span className='grow pl-5 text-left font-sansTitle text-navBarHeader font-medium leading-lhSomeSpace text-altGreen no-underline lg:flex xs:hidden'>
            Health Equity Tracker
          </span>
        </HetNavLink>
      </h1>

      <nav className='flex flex-wrap justify-evenly'>
        {renderNavItems(NAVIGATION_STRUCTURE)}
        <HetCTALinkSmall
          id='navigationCTA'
          href={EXPLORE_DATA_PAGE_LINK}
          className='ml-4'
        >
          Explore the data
        </HetCTALinkSmall>
      </nav>
    </Toolbar>
  )
}
