<<<<<<< HEAD
=======
import { Toolbar, Menu, MenuItem } from '@mui/material'
>>>>>>> 8bb0b569 (create hetnavbutton, start adding menu folders)
import { useState } from 'react'
import { Toolbar, Menu, MenuItem } from '@mui/material'
import AppBarLogo from '../../assets/AppbarLogo.png'
import { NAVIGATION_STRUCTURE } from '../../utils/urlutils'
import HetNavLink from './HetNavLink'
import HetNavButton from './HetNavButton'
<<<<<<< HEAD
import HetCTASmall from './HetCTASmall'
import { EXPLORE_DATA_PAGE_LINK } from '../../utils/internalRoutes'
=======
>>>>>>> 8bb0b569 (create hetnavbutton, start adding menu folders)

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
<<<<<<< HEAD
          <span className='grow pl-5 text-left font-sansTitle text-navBarHeader font-medium leading-lhSomeSpace text-altGreen no-underline lg:flex xs:hidden'>
=======
          <span className='grow pl-5 text-left font-sansTitle text-navBarHeader font-medium leading-lhSomeSpace text-altGreen no-underline'>
>>>>>>> 8bb0b569 (create hetnavbutton, start adding menu folders)
            Health Equity Tracker
          </span>
        </HetNavLink>
      </h1>

<<<<<<< HEAD
      <nav className='flex flex-wrap justify-evenly'>
        {renderNavItems(NAVIGATION_STRUCTURE)}
        <HetCTASmall id='navigationCTA' href={EXPLORE_DATA_PAGE_LINK}>
          Explore the data
        </HetCTASmall>
=======
      <nav className='flex max-w-sm flex-wrap justify-evenly lg:max-w-lg'>
        {Object.entries(PAGE_URL_TO_NAMES).map(([pageUrl, pageName]) => (
          <HetNavLink
            key={pageUrl}
            href={pageUrl}
          
          >
            {pageName}
          </HetNavLink>
        ))}
        <div className='relative'>
        <HetNavButton
            label='Data'
            onClick={(e) => handleClick(e, 'Data')}
            isExpanded={activeMenu === 'Data'}
          />
          <Menu
            anchorEl={anchorEl}
            open={activeMenu === 'Data'}
            onClose={handleClose}
            classes={{ paper: 'bg-white' }}
          >
            <MenuItem onClick={handleClose}>
              <HetNavLink href='/data/explore'>Explore Data</HetNavLink>
            </MenuItem>
            <MenuItem onClick={handleClose}>
              <HetNavLink href='/data/catalog'>Data Catalog</HetNavLink>
            </MenuItem>
          </Menu>
        </div>
        <div className='relative'>
        <HetNavButton
            label='Data'
            onClick={(e) => handleClick(e, 'Data')}
            isExpanded={activeMenu === 'Data'}
          />
          <Menu
            anchorEl={anchorEl}
            open={activeMenu === 'About'}
            onClose={handleClose}
            classes={{ paper: 'bg-white' }}
          >
            <MenuItem onClick={handleClose}>
              <HetNavLink href='/about/mission'>Our Mission</HetNavLink>
            </MenuItem>
            <MenuItem onClick={handleClose}>
              <HetNavLink href='/about/team'>Our Team</HetNavLink>
            </MenuItem>
          </Menu>
        </div>
>>>>>>> 8bb0b569 (create hetnavbutton, start adding menu folders)
      </nav>
    </Toolbar>
  )
}