import { Toolbar, Menu, MenuItem } from '@mui/material'
import { useState } from 'react'
import AppBarLogo from '../../assets/AppbarLogo.png'
import { PAGE_URL_TO_NAMES } from '../../utils/urlutils'
import HetNavLink from './HetNavLink'
import HetNavButton from './HetNavButton'

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
      </nav>
    </Toolbar>
  )
}